import {inject, observer} from '@makeflow/mobx-utils';
import classNames from 'classnames';
import React, {Component, ReactNode} from 'react';
import {ExpandButton, MosaicBranch, MosaicWindow} from 'react-mosaic-component';

import {
  Task,
  TaskId,
  TaskService,
  TaskStatus,
  getTaskStatus,
} from 'services/task-service';
import {styled} from 'theme';

import {Block} from './@block';
import {
  WindowRemoveButton,
  WindowRestartButton,
  WindowStatusDot,
  WindowStopButton,
} from './@window-tools';
import {WindowStartButton} from './@window-tools/window-start-button';

const Wrapper = styled.div`
  flex: 1;
  display: flex;
`;

const MosaicWindowWithType = MosaicWindow.ofType<TaskId>();

const WindowWrapper = styled(MosaicWindowWithType)`
  flex: 1;
  box-sizing: border-box;

  &.hover {
    animation: pulse 0.75s;
  }

  ${WindowStatusDot.Wrapper} {
    position: absolute;
    top: 15px;
    left: 5px;
  }

  ${Block.Wrapper} {
    transition: opacity 0.3s;

    &.stopped {
      opacity: 0.9;
      transition: opacity 0.3s;
    }
  }
`;

const WindowSubTitle = styled.div`
  position: absolute;
  font-size: 12px;
  top: 10px;
  left: 85px;
  right: 85px;
  height: 18px;
  white-space: nowrap;
  overflow: hidden;
  flex: none;
  text-align: center;
  pointer-events: none;
  text-overflow: ellipsis;
  user-select: none;
  color: ${props => props.theme.text.hint};
`;

export interface WindowProps {
  className?: string;
  id: TaskId;
  path: MosaicBranch[];
}

@observer
export class Window extends Component<WindowProps> {
  @inject
  taskService!: TaskService;

  render(): ReactNode {
    let {className, id, path} = this.props;

    let task = this.taskService.createdTaskMap.get(id)!;

    let {name, output, status} = task;

    let hover = id === this.taskService.currentHoverTaskId;

    return (
      <Wrapper className={classNames('window', className)}>
        <WindowWrapper
          path={path}
          title={name}
          className={hover ? 'hover' : undefined}
          toolbarControls={
            <>
              {status === TaskStatus.running ? (
                <WindowRestartButton
                  onClick={() => {
                    this.onRestartButtonClick(task);
                  }}
                />
              ) : (
                undefined
              )}
              {status === TaskStatus.running ||
              status === TaskStatus.restarting ? (
                <WindowStopButton
                  onClick={() => {
                    this.onStopButtonClick(task);
                  }}
                />
              ) : (
                undefined
              )}
              {status === TaskStatus.stopped ||
              status === TaskStatus.stopping ? (
                <WindowStartButton
                  onClick={() => {
                    this.onStartButtonClick(task);
                  }}
                />
              ) : (
                undefined
              )}
              <ExpandButton />
              <WindowRemoveButton
                onClick={() => {
                  this.onRemoveButtonClick(task);
                }}
              />
            </>
          }
        >
          <WindowStatusDot status={status} />
          <WindowSubTitle>{getTaskStatus(task)}</WindowSubTitle>
          <Block
            html={output}
            className={status === TaskStatus.stopped ? 'stopped' : undefined}
          />
        </WindowWrapper>
      </Wrapper>
    );
  }

  onRemoveButtonClick = (task: Task): void => {
    this.taskService.close(task);
  };

  onRestartButtonClick = (task: Task): void => {
    this.taskService.restart(task);
  };

  onStopButtonClick = (task: Task): void => {
    this.taskService.stop(task);
  };

  onStartButtonClick = (task: Task): void => {
    this.taskService.start(task);
  };

  static Wrapper = Wrapper;
}
