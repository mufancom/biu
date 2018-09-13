import {inject, observer} from '@makeflow/mobx-utils';
import classNames from 'classnames';
import {action} from 'mobx';
import React, {Component, ReactNode} from 'react';
import {Mosaic, MosaicNode} from 'react-mosaic-component';

import {TaskId, TaskService} from 'services/task-service';
import {styled} from 'theme';

import {ManagerStyle} from './@manager-style';
import {Window} from './@window';

const WindowManager = Mosaic.ofType<TaskId>();

const Wrapper = styled(ManagerStyle)`
  padding: 20px 40px;
`;

export interface ManagerProps {
  className?: string;
}

@observer
export class Manager extends Component<ManagerProps> {
  @inject
  taskService!: TaskService;

  windowKey: number = 0;

  render(): ReactNode {
    let {className} = this.props;

    return (
      <Wrapper className={classNames('manager', className)}>
        <WindowManager
          key={this.windowKey}
          renderTile={(id, path) => {
            return <Window id={id} path={path} />;
          }}
          onChange={this.onWindowChange}
          value={this.taskService.currentNode}
        />
      </Wrapper>
    );
  }

  @action
  onWindowChange = (newNode: MosaicNode<TaskId> | null): void => {
    this.taskService.currentNode = newNode;
  };

  static Wrapper = Wrapper;
}
