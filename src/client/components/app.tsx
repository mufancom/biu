import {inject, observer} from '@makeflow/mobx-utils';
import classNames from 'classnames';
import React, {Component, ReactNode} from 'react';

import {TaskService} from 'services/task-service';
import {styled} from 'theme';

import {DisconnectedView} from './disconnected/disconnected-view';
import {Menu} from './menu';
import {Manager} from './window-manager';

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  height: 100vh;
  position: relative;

  ${Menu.Wrapper} {
    width: 320px;
    height: 100vh;
  }

  ${Manager.Wrapper} {
    flex: 1;
  }
`;

export interface AppProps {
  className?: string;
}

@observer
export class App extends Component<AppProps> {
  @inject
  taskService!: TaskService;

  render(): ReactNode {
    let {className} = this.props;

    let connect = this.taskService.connected;

    return (
      <Wrapper className={classNames('app', className)}>
        <DisconnectedView connect={connect} />
        <Menu />
        <Manager />
      </Wrapper>
    );
  }
}
