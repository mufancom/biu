import {action, observable} from 'mobx';

import {SocketIOService} from './socket-io-service';

export type TaskId = string;

export interface Task {
  id?: TaskId;
  name: string;
  line?: string;
  running: boolean;
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
    this.socketIOService.on('stdout', this.onStdOut);
    this.socketIOService.on('stderr', this.onStdErr);
  }

  onConnect = (): void => {
    // tslint:disable-next-line
    console.log('connected');
  };

  @action
  onInitialize = ({
    createdTasks,
    taskGroups,
    taskNames,
  }: InitializeData): void => {
    if (taskGroups) {
      this.taskGroups = taskGroups;
    }

    if (taskNames) {
      for (let taskName of taskNames) {
        this.tasks[name] = {
          name: taskName,
          running: false,
          output: '',
        };
      }
    }

    for (let task of createdTasks) {
      let {id, name} = task;

      this.tasks[name] = task;

      this.createdTaskMap.set(id, task);
    }
  };

  onCreate = (task: CreatedTask): void => {
    let {id, name} = task;

    task.running = true;

    this.tasks[name] = task;

    this.createdTaskMap.set(id, task);
  };

  onClose = (taskRef: TaskRef): void => {
    let {id} = taskRef;

    let task = this.createdTaskMap.get(id);

    if (!task) {
      return;
    }

    this.createdTaskMap.delete(id);
  };

  onStart = (taskRef: TaskRef): void => {
    let {id} = taskRef;

    let task = this.createdTaskMap.get(id);

    if (!task) {
      return;
    }

    task.running = true;
  };

  onStop = (taskRef: TaskRef): void => {
    let {id} = taskRef;

    let task = this.createdTaskMap.get(id);

    if (!task) {
      return;
    }

    task.running = false;
  };

  onRestartOnChange = (taskRef: TaskRef): void => {
    let {id} = taskRef;

    let task = this.createdTaskMap.get(id);

    if (!task) {
      return;
    }

    // TODO: add status tip to the block
  };

  onError = (data: ErrorData): void => {
    let {id, code} = data;

    let task = this.createdTaskMap.get(id);

    if (!task) {
      return;
    }

    // TODO: add status tip to the block
  };

  onStdOut = (data: StdOutData): void => {
    let {id, html} = data;

    let task = this.createdTaskMap.get(id);

    if (!task) {
      return;
    }

    task.output += html;
  };

  onStdErr = (data: StdErrData): void => {
    let {id, html} = data;

    let task = this.createdTaskMap.get(id);

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
