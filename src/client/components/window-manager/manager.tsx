import {inject, observer} from '@makeflow/mobx-utils';
import classNames from 'classnames';
import {action} from 'mobx';
import React, {Component, ReactNode} from 'react';
import Icon from 'react-fa';
import {Mosaic, MosaicNode} from 'react-mosaic-component';

import {TaskId, TaskService} from 'services/task-service';
import {styled} from 'theme';

import {ManagerStyle} from './@manager-style';
import {ToolBarButton} from './@tool-bar-button';
import {Window} from './@window';

const WindowManager = Mosaic.ofType<TaskId>();

const Wrapper = styled(ManagerStyle)`
  padding: 30px 40px 20px 40px;
  transition: all 0.5s;

  &.single-windowed {
    padding-top: 20px;
    transition: all 0.5s;
  }
`;

const ToolBar = styled.div`
  position: absolute;
  font-size: 11px;
  right: 55px;
  top: 15px;
  transition: all 0.5s;
  opacity: 0.5;

  &.hidden {
    opacity: 0;
    transition: all 0.3s;
    pointer-events: none;

    &:hover {
      opacity: 0;
    }
  }

  &:hover {
    opacity: 1;
    transition: all 0.3s;
  }
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

    let hideToolBar = this.taskService.createdTaskMap.size < 2;

    return (
      <Wrapper
        className={classNames(
          'manager',
          className,
          hideToolBar ? 'single-windowed' : undefined,
        )}
      >
        <ToolBar className={hideToolBar ? 'hidden' : undefined}>
          <ToolBarButton
            accent="green"
            icon="play"
            title="Start all"
            onClick={this.onStartAllClick}
          />
          <ToolBarButton
            accent="yellow"
            icon="repeat"
            title="Restart all"
            onClick={this.onRestartAllClick}
          />
          <ToolBarButton
            accent="red"
            icon="power-off"
            title="Stop all"
            onClick={this.onStopAllClick}
          />
          <ToolBarButton
            accent="red"
            icon="close"
            title="Close all"
            onClick={this.onCloseAllClick}
          />
          <ToolBarButton
            icon="columns"
            title="Auto arrange"
            onClick={this.onAutoArrangeClick}
          />
        </ToolBar>
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

  onStartAllClick = (): void => {
    this.taskService.startAll();
  };

  onRestartAllClick = (): void => {
    this.taskService.restartAll();
  };

  onStopAllClick = (): void => {
    this.taskService.stopAll();
  };

  onCloseAllClick = (): void => {
    this.taskService.closeAll();
  };

  onAutoArrangeClick = (): void => {
    this.taskService.autoArrangeWindows();
  };

  static Wrapper = Wrapper;
}
