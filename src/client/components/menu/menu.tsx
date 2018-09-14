import {observer} from '@makeflow/mobx-utils';
import classNames from 'classnames';
import {action, observable} from 'mobx';
import React, {Component, ReactNode} from 'react';

import {styled} from 'theme';

import {Group} from './@group';
import {Logo} from './@logo';
import {PinButton} from './@pin-button';

const Wrapper = styled.div`
  background-color: #fff;
  display: flex;
  flex-direction: column;
  padding-top: 6px;
  position: fixed;
  z-index: 999;
  transition: all 0.5s;

  &.pinned {
    position: static;
  }

  &.hide {
    transform: translateX(-285px);
    transition: all 0.5s;
    cursor: pointer;

    ${Group.Wrapper} {
      opacity: 0;
      transition: all 0.5s;
    }
  }

  ${Group.Wrapper} {
    padding: 5px 10px 5px 16px;
    flex: 1;
  }
`;

const TopTool = styled.div`
  text-align: right;
  padding-right: 10px;
`;

const Header = styled.div`
  height: 36px;
  padding: 10px 20px 20px 20px;
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
  @observable
  pinned = true;

  @observable
  hide = false;

  render(): ReactNode {
    let {className} = this.props;

    return (
      <Wrapper
        className={classNames(
          'menu',
          className,
          this.pinned ? 'pinned' : undefined,
          !this.pinned && this.hide ? 'hide' : undefined,
        )}
        onMouseOver={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
      >
        <TopTool>
          <PinButton
            pinned={this.pinned}
            hide={this.hide}
            onClick={this.onPinButtonClick}
          />
        </TopTool>
        <Header>
          <Logo />
        </Header>
        <Group />
      </Wrapper>
    );
  }

  @action
  onPinButtonClick = (): void => {
    this.pinned = !this.pinned;
  };

  @action
  onMouseEnter = (): void => {
    this.hide = false;
  };

  @action
  onMouseLeave = (): void => {
    this.hide = true;
  };

  static Wrapper = Wrapper;
}
