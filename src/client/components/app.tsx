import 'react-mosaic-component/react-mosaic-component.css';

import {inject, observer} from '@makeflow/mobx-utils';
import React, {Component} from 'react';
import {Mosaic, MosaicWindow} from 'react-mosaic-component';

import {TaskId, TaskService} from '../services/task-service';
import {mapObject} from '../utils/lang';

const TaskIdMosaic = Mosaic.ofType<TaskId>();

const TaskIdMosaicWindow = MosaicWindow.ofType<TaskId>();

@observer
export class App extends Component {
  @inject
  taskService!: TaskService;

  componentWillMount(): void {}

  render(): JSX.Element {
    return (
      <div>
        {mapObject(this.taskService.tasks, task => {
          return <div key={task.name}>{task.name}</div>;
        })}
        <div style={{display: 'block', height: '90vh', width: '100%'}}>
          <TaskIdMosaic
            renderTile={(_id, path) => (
              <TaskIdMosaicWindow path={path} title={'haha'}>
                <h1>haha</h1>
              </TaskIdMosaicWindow>
            )}
            initialValue={{
              direction: 'row',
              first: 'a',
              second: 'b',
              splitPercentage: 40,
            }}
          />
        </div>
      </div>
    );
  }
}
