import {observer} from '@makeflow/mobx-utils';
import classNames from 'classnames';
import React, {Component, ReactNode} from 'react';
import {Mosaic, MosaicWindow} from 'react-mosaic-component';

import {TaskId} from 'services/task-service';
import {styled} from 'theme';

import {Block} from './@block';
import {ManagerStyle} from './manager-style';

const WindowManager = Mosaic.ofType<TaskId>();

const Window = styled(MosaicWindow.ofType<TaskId>())`
  flex: 1;
`;

const Wrapper = styled(ManagerStyle)`
  padding: 20px 40px;
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
  color: ${props => props.theme.text.hint};
`;

export interface ManagerProps {
  className?: string;
}

@observer
export class Manager extends Component<ManagerProps> {
  render(): ReactNode {
    let {className} = this.props;

    return (
      <Wrapper className={classNames('manager', className)}>
        <WindowManager
          renderTile={(id, path) => (
            <Window path={path} title="test">
              <WindowSubTitle>tsc -p src/cli -w</WindowSubTitle>
              <Block />
            </Window>
          )}
          initialValue={{
            direction: 'column',
            first: {
              direction: 'row',
              first: 'hello',
              second: 'hello2',
            },
            second: {
              direction: 'row',
              first: 'hello3',
              second: 'hello4',
            },
          }}
        />
      </Wrapper>
    );
  }

  static Wrapper = Wrapper;
}
