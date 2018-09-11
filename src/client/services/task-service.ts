import {action, observable} from 'mobx';

import {SocketIOService} from './socket-io-service';

export type TaskId = string;

export interface Task {
  id?: TaskId;
  name: string;
  line?: string;
  running: boolean;
  output?: string;
}

export interface TaskGroupDict {
  [key: string]: string[];
}

export interface TaskDict {
  [key: string]: Task;
}

export interface InitializeData {
  createdTasks: Task[];
  taskGroups: TaskGroupDict;
  taskNames: string[];
}

export class TaskService {
  @observable
  taskGroups: TaskGroupDict = {};

  @observable
  tasks: TaskDict = {};

  @observable
  createdTaskMap = new Map<TaskId, Task>();

  constructor(private socketIOService: SocketIOService) {
    this.socketIOService.on('connect', this.onConnect);
    this.socketIOService.on('initialize', this.onInitialize);
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
    this.taskGroups = taskGroups;

    for (let taskName of taskNames) {
      this.tasks[name] = {
        name: taskName,
        running: false,
      };
    }

    for (let task of createdTasks) {
      let {id, name} = task;

      this.tasks[name] = task;

      this.createdTaskMap.set(id!, task);
    }
  };
}
