import {observer} from '@makeflow/mobx-utils';
import classNames from 'classnames';
import React, {Component, ReactNode} from 'react';

import {styled} from 'theme';

import {Menu} from './menu';
import {Manager} from './window';

const Wrapper = styled.div``;

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
