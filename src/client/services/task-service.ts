import _ from 'lodash';
import {action, observable} from 'mobx';
import {
  Corner,
  MosaicBranch,
  MosaicDirection,
  MosaicNode,
  MosaicParent,
  createBalancedTreeFromLeaves,
  createRemoveUpdate,
  getLeaves,
  getNodeAtPath,
  getOtherDirection,
  getPathToCorner,
  updateTree,
} from 'react-mosaic-component';

import {appendOutput, outputError, outputInfo} from 'utils/output';

import {SocketIOService} from './socket-io-service';

export type TaskId = string;

export enum TaskStatus {
  ready,
  running,
  stopped,
  stopping,
  restarting,
}

export interface Task {
  id?: TaskId;
  name: string;
  line?: string;
  running: boolean;
  status: TaskStatus;
  output: string;
}

export interface CreatedTask extends Task {
  id: TaskId;
}

export interface TaskRef {
  id: TaskId;
}

export interface TaskGroupDict {
  [key: string]: string[];
}

export interface TaskDict {
  [key: string]: Task;
}

export interface InitializeData {
  createdTasks: CreatedTask[];
  taskGroups: TaskGroupDict;
  taskNames: string[];
}

export interface ErrorData {
  id: TaskId;
  error: string;
}

export interface ExitData {
  id: TaskId;
  code?: string;
}

export interface StdOutData {
  id: TaskId;
  html: string;
}

export interface StdErrData {
  id: TaskId;
  html: string;
}

export class TaskService {
  @observable
  taskGroups: TaskGroupDict = {};

  @observable
  tasks: TaskDict = {};

  @observable
  createdTaskMap = new Map<TaskId, CreatedTask>();

  @observable
  currentNode: MosaicNode<TaskId> | null = null;

  @observable
  currentHoverTaskId: TaskId | undefined;

  constructor(private socketIOService: SocketIOService) {
    this.socketIOService.on('connect', this.onConnect);
    this.socketIOService.on('initialize', this.onInitialize);
    this.socketIOService.on('create', this.onCreate);
    this.socketIOService.on('close', this.onClose);
    this.socketIOService.on('start', this.onStart);
    this.socketIOService.on('stop', this.onStop);
    this.socketIOService.on('restarting-on-change', this.onRestartOnChange);
    this.socketIOService.on('error', this.onError);
    this.socketIOService.on('exit', this.onExit);
    this.socketIOService.on('stdout', this.onStdOut);
    this.socketIOService.on('stderr', this.onStdErr);
  }

  isCreated(task: Task): task is CreatedTask {
    let {id} = task;

    return typeof id !== 'undefined' && this.createdTaskMap.has(id);
  }

  start(task: Task): void {
    if (!this.isCreated(task)) {
      let {name} = task;

      this.socketIOService.emit('create', {names: [name]});
    } else if (!task.running) {
      let {id} = task;

      this.socketIOService.emit('start', {id});
    }
  }

  startAll(): void {
    for (let task of this.createdTaskMap.values()) {
      this.start(task);
    }
  }

  @action
  restart(task: Task): void {
    if (!this.isCreated(task)) {
      return;
    }

    let {id} = task;

    task.status = TaskStatus.restarting;

    this.socketIOService.emit('restart', {id});
  }

  restartAll(): void {
    for (let task of this.createdTaskMap.values()) {
      this.restart(task);
    }
  }

  @action
  stop(task: Task): void {
    if (
      !this.isCreated(task) ||
      (task.status !== TaskStatus.running &&
        task.status !== TaskStatus.restarting)
    ) {
      return;
    }

    let {id} = task;

    task.status = TaskStatus.stopping;

    this.socketIOService.emit('stop', {id});
  }

  stopAll(): void {
    for (let task of this.createdTaskMap.values()) {
      this.stop(task);
    }
  }

  @action
  close(task: Task): void {
    if (!this.isCreated(task)) {
      return;
    }

    let {id, running} = task;

    if (running) {
      task.status = TaskStatus.stopping;
    }

    this.socketIOService.emit('close', {id});
  }

  closeAll(): void {
    for (let task of this.createdTaskMap.values()) {
      this.close(task);
    }
  }

  @action
  autoArrangeWindows(): void {
    let leaves = getLeaves(this.currentNode);

    this.currentNode = createBalancedTreeFromLeaves(leaves);
  }

  private getCreatedTaskByTaskId(id: TaskId): CreatedTask | undefined {
    let task = this.createdTaskMap.get(id);

    if (!task) {
      return undefined;
    }

    let {name} = task;

    return this.tasks[name] as CreatedTask;
  }

  @action
  private freshCurrentNode(): void {
    let createdTaskIds = Array.from(this.createdTaskMap.keys());
    let currentNodeIds = getLeaves(this.currentNode);

    let newTaskIds = _.difference(createdTaskIds, currentNodeIds);
    let removedTaskIds = _.difference(currentNodeIds, createdTaskIds);

    for (let taskId of removedTaskIds) {
      this.closeTaskWindow(taskId);
    }

    for (let newTaskId of newTaskIds) {
      this.addToBottomRight(newTaskId);
    }
  }

  @action
  private addToBottomRight = (taskId: TaskId): void => {
    let currentNode = this.currentNode;

    if (currentNode) {
      const path = getPathToCorner(currentNode, Corner.BOTTOM_RIGHT);
      const parent = getNodeAtPath(
        currentNode,
        _.dropRight(path),
      ) as MosaicParent<TaskId>;
      const destination = getNodeAtPath(currentNode, path) as MosaicNode<
        TaskId
      >;
      const direction: MosaicDirection = parent
        ? getOtherDirection(parent.direction)
        : 'row';
      let first: MosaicNode<TaskId>;
      let second: MosaicNode<TaskId>;

      first = destination;
      second = taskId;

      this.currentNode = updateTree(currentNode, [
        {
          path,
          spec: {
            $set: {
              direction,
              first,
              second,
            },
          },
        },
      ]);
    } else {
      this.currentNode = taskId;
    }
  };

  @action
  private closeTaskWindow(taskId: TaskId): void {
    if (this.currentNode) {
      let path = getPathByTaskIdInNode(this.currentNode, taskId);

      if (typeof path === 'object') {
        let update = createRemoveUpdate(this.currentNode, path);

        this.currentNode = updateTree(this.currentNode, [update]);
      } else if (path === 'clean') {
        this.currentNode = null;
      }
    }
  }

  @action
  private onConnect = (): void => {
    // tslint:disable-next-line
    console.log('connected');
  };

  @action
  private onInitialize = ({
    createdTasks,
    taskGroups,
    taskNames,
  }: InitializeData): void => {
    this.taskGroups = {};
    this.tasks = {};
    this.createdTaskMap = new Map<TaskId, CreatedTask>();
    this.currentNode = null;
    this.currentHoverTaskId = undefined;

    if (taskGroups) {
      this.taskGroups = taskGroups;
    }

    if (taskNames) {
      for (let taskName of taskNames) {
        this.tasks[taskName] = {
          name: taskName,
          running: false,
          status: TaskStatus.ready,
          output: '',
        };
      }
    }

    let createdLeaves: TaskId[] = [];

    for (let task of createdTasks) {
      let {id, name} = task;

      task.status = task.running ? TaskStatus.running : TaskStatus.stopped;

      task.output = '';

      this.tasks[name] = task;

      this.createdTaskMap.set(id, task);

      createdLeaves.push(id);
    }

    this.currentNode = createBalancedTreeFromLeaves(createdLeaves);

    this.freshCurrentNode();
  };

  @action
  private onCreate = (task: CreatedTask): void => {
    let {id, name} = task;

    task.running = true;
    task.status = TaskStatus.running;

    this.tasks[name] = task;

    this.createdTaskMap.set(id, task);

    this.freshCurrentNode();
  };

  @action
  private onClose = (taskRef: TaskRef): void => {
    let {id} = taskRef;

    let task = this.getCreatedTaskByTaskId(id);

    if (!task) {
      return;
    }

    task.running = false;
    task.status = TaskStatus.ready;

    this.createdTaskMap.delete(id);

    this.freshCurrentNode();
  };

  @action
  private onStart = (taskRef: TaskRef): void => {
    let {id} = taskRef;

    let task = this.getCreatedTaskByTaskId(id);

    if (!task) {
      return;
    }

    task.running = true;
    task.status = TaskStatus.running;

    task.output = appendOutput(
      task.output,
      outputInfo('[biu] Task started.'),
      'system',
    );

    this.createdTaskMap.set(id, task);
  };

  @action
  private onStop = (taskRef: TaskRef): void => {
    let {id} = taskRef;

    let task = this.getCreatedTaskByTaskId(id);

    if (!task) {
      return;
    }

    task.running = false;
    task.status = TaskStatus.stopped;

    this.createdTaskMap.set(id, task);
  };

  @action
  private onRestartOnChange = (taskRef: TaskRef): void => {
    let {id} = taskRef;

    let task = this.getCreatedTaskByTaskId(id);

    if (!task) {
      return;
    }

    task.running = false;
    task.status = TaskStatus.restarting;

    task.output = appendOutput(
      task.output,
      outputInfo('[biu] Restarting on change...'),
      'system',
    );

    this.createdTaskMap.set(id, task);
  };

  @action
  private onError = (data: ErrorData): void => {
    let {id, error} = data;

    let task = this.getCreatedTaskByTaskId(id);

    if (!task) {
      return;
    }

    task.output = appendOutput(
      task.output,
      outputError(error.replace(/\n/g, '<br />')),
      'system',
    );

    this.createdTaskMap.set(id, task);
  };

  @action
  private onExit = (data: ExitData): void => {
    let {id, code} = data;

    let task = this.getCreatedTaskByTaskId(id);

    if (!task) {
      return;
    }

    let text = code
      ? `[biu] Task exited with code ${data.code}.`
      : '[biu] Task exited.';

    task.output = appendOutput(task.output, outputInfo(text), 'system');

    this.createdTaskMap.set(id, task);
  };

  @action
  private onStdOut = (data: StdOutData): void => {
    let {id, html} = data;

    let task = this.getCreatedTaskByTaskId(id);

    if (!task) {
      return;
    }

    if (html) {
      task.output = appendOutput(task.output, html);
    }

    this.createdTaskMap.set(id, task);
  };

  @action
  private onStdErr = (data: StdErrData): void => {
    let {id, html} = data;

    let task = this.getCreatedTaskByTaskId(id);

    if (!task) {
      return;
    }

    if (html) {
      task.output = appendOutput(task.output, html);
    }

    this.createdTaskMap.set(id, task);
  };
}

export function getTaskStatus(task: Task | undefined): string {
  if (!task) {
    return 'closed';
  }

  let {status, line} = task;

  switch (status) {
    case TaskStatus.ready:
      return 'ready';
    case TaskStatus.running:
      return line ? line : 'running';
    case TaskStatus.stopped:
      return 'stopped';
    case TaskStatus.stopping:
      return 'stopping';
    case TaskStatus.restarting:
      return 'restarting';
  }
}

export function getPathByTaskIdInNode(
  node: MosaicNode<TaskId> | TaskId | undefined,
  taskId: TaskId,
  path?: string,
): MosaicBranch[] | 'clean' | undefined {
  if (typeof node === 'string' && node === taskId) {
    if (path) {
      return path.split('|') as MosaicBranch[];
    } else {
      return 'clean';
    }
  } else if (typeof node === 'object') {
    let firstBranchResult = getPathByTaskIdInNode(
      node['first'],
      taskId,
      path ? `${path}|first` : 'first',
    );

    if (firstBranchResult) {
      return firstBranchResult;
    }

    let secondBranchResult = getPathByTaskIdInNode(
      node['second'],
      taskId,
      path ? `${path}|second` : 'second',
    );

    if (secondBranchResult) {
      return secondBranchResult;
    }
  }

  return undefined;
}
