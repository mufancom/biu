import {action, observable} from 'mobx';

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
  code: number;
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

  constructor(private socketIOService: SocketIOService) {
    this.socketIOService.on('connect', this.onConnect);
    this.socketIOService.on('initialize', this.onInitialize);
    this.socketIOService.on('create', this.onCreate);
    this.socketIOService.on('close', this.onClose);
    this.socketIOService.on('start', this.onStart);
    this.socketIOService.on('stop', this.onStop);
    this.socketIOService.on('restarting-on-change', this.onRestartOnChange);
    this.socketIOService.on('error', this.onError);
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

  @action
  restart(task: Task): void {
    if (!this.isCreated(task)) {
      return;
    }

    let {id} = task;

    task.status = TaskStatus.restarting;

    this.socketIOService.emit('restart', {id});
  }

  @action
  stop(task: Task): void {
    if (!this.isCreated(task)) {
      return;
    }

    let {id} = task;

    task.status = TaskStatus.stopping;

    this.socketIOService.emit('stop', {id});
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

  private getCreatedTaskByTaskId(id: TaskId): Task | undefined {
    let task = this.createdTaskMap.get(id);

    if (!task) {
      return undefined;
    }

    let {name} = task;

    return this.tasks[name];
  }

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

    for (let task of createdTasks) {
      let {id, name} = task;

      task.status = task.running ? TaskStatus.running : TaskStatus.stopped;

      this.tasks[name] = task;

      this.createdTaskMap.set(id, task);
    }
  };

  @action
  private onCreate = (task: CreatedTask): void => {
    let {id, name} = task;

    task.running = true;
    task.status = TaskStatus.running;

    this.tasks[name] = task;

    this.createdTaskMap.set(id, task);
  };

  @action
  private onClose = (taskRef: TaskRef): void => {
    let {id} = taskRef;

    let task = this.getCreatedTaskByTaskId(id);

    if (!task) {
      return;
    }

    task.status = TaskStatus.ready;

    this.createdTaskMap.delete(id);
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
  };

  @action
  private onRestartOnChange = (taskRef: TaskRef): void => {
    let {id} = taskRef;

    let task = this.getCreatedTaskByTaskId(id);

    if (!task) {
      return;
    }

    // TODO: add status tip to the block
  };

  @action
  private onError = (data: ErrorData): void => {
    let {id, code} = data;

    let task = this.getCreatedTaskByTaskId(id);

    if (!task) {
      return;
    }

    // tslint:disable-next-line
    console.log(code);

    // TODO: add status tip to the block
  };

  @action
  private onStdOut = (data: StdOutData): void => {
    let {id, html} = data;

    let task = this.getCreatedTaskByTaskId(id);

    if (!task) {
      return;
    }

    task.output += html;
  };

  @action
  private onStdErr = (data: StdErrData): void => {
    let {id, html} = data;

    let task = this.getCreatedTaskByTaskId(id);

    if (!task) {
      return;
    }

    task.output += html;
  };

  // private getTask(name: string): Task {
  //   if (!(name in this.tasks)) {
  //     this.tasks[name] = {
  //       name,
  //       running: false,
  //     };
  //   }
  //
  //   return this.tasks[name];
  // }
}

export function getTaskStatus(task: Task): string {
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
