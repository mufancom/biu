import {inject, observer} from '@makeflow/mobx-utils';
import classNames from 'classnames';
import {action} from 'mobx';
import React, {Component, ReactNode} from 'react';
import {ExpandButton, MosaicBranch, MosaicWindow} from 'react-mosaic-component';

import {TaskId, TaskService, TaskStatus} from 'services/task-service';
import {styled} from 'theme';

import {Block} from './@block';
import {WindowRemoveButton} from './@window-buttons';

const Wrapper = styled.div`
  flex: 1;
  display: flex;
`;

const WindowWrapper = styled(MosaicWindow.ofType<TaskId>())`
  flex: 1;
`;

const WindowSubTitle = styled.div`
  position: absolute;
  font-size: 12px;
  top: 10px;
  left: 50px;
  right: 50px;
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

    let has = this.taskService.createdTaskMap.get(id);

    return (
      <Wrapper className={classNames('window', className)}>
        <WindowWrapper
          path={path}
          title="test"
          toolbarControls={
            <>
              <ExpandButton />
              <WindowRemoveButton
                onClick={() => {
                  this.onRemoveButtonClick(id);
                }}
              />
            </>
          }
        >
          <WindowSubTitle>
            tsc -p src/cli -w {has ? 'yes' : 'no'}
          </WindowSubTitle>
          <Block />
        </WindowWrapper>
      </Wrapper>
    );
  }

  @action
  onRemoveButtonClick = (id: TaskId): void => {
    this.taskService.createdTaskMap.set(id, {
      name: 'haha',
      status: TaskStatus.ready,
      running: true,
      id: '23',
      output: '',
    });
  };

  static Wrapper = Wrapper;
}
