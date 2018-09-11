import {inject, observer} from '@makeflow/mobx-utils';
import React, {Component} from 'react';

import {TaskService} from '../services/task-service';
import {mapObject} from '../utils/lang';

@observer
export class App extends Component {
  @inject
  taskService!: TaskService;

  componentWillMount(): void {}

  render(): JSX.Element {
    return (
      <div>
        {mapObject(this.taskService.tasks, task => {
          return <div>{task.name}</div>;
        })}
      </div>
    );
  }
}
