import {observer} from '@makeflow/mobx-utils';
import classNames from 'classnames';
import React, {Component, ReactNode} from 'react';

import {styled} from 'theme';

import {Group} from './@group';
import {Logo} from './@logo';

const Wrapper = styled.div`
  background-color: #fff;
  display: flex;
  flex-direction: column;

  ${Group.Wrapper} {
    padding: 5px 10px 5px 26px;
    flex: 1;
  }
`;

const Header = styled.div`
  height: 36px;
  padding: 30px 20px 20px 20px;
  flex: none;

  ${Logo.Wrapper} {
    margin: auto;
  }
`;

export interface MenuProps {
  className?: string;
}

@observer
export class Menu extends Component<MenuProps> {
  render(): ReactNode {
    let {className} = this.props;

    return (
      <Wrapper className={classNames('menu', className)}>
        <Header>
          <Logo />
        </Header>
        <Group />
      </Wrapper>
    );
  }

  static Wrapper = Wrapper;
}
