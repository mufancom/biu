import {inject, observer} from '@makeflow/mobx-utils';
import React, {Component} from 'react';

import {TaskService} from '../services/task-service';

@observer
export class App extends Component {
  @inject
  taskService!: TaskService;

  componentWillMount(): void {}

  render(): JSX.Element {
    return <div>Hello</div>;
  }
}
