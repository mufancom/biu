import {observer} from '@makeflow/mobx-utils';
import classNames from 'classnames';
import React, {Component, ReactNode} from 'react';

import {styled} from 'theme';

import {Menu} from './menu';
import {Manager} from './window';

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
  render(): ReactNode {
    let {className} = this.props;

    return (
      <Wrapper className={classNames('app', className)}>
        <Menu />
        <Manager />
      </Wrapper>
    );
  }
}
