import 'rc-dropdown/assets/index.css';

import {observer} from '@makeflow/mobx-utils';
import classNames from 'classnames';
import {action, observable} from 'mobx';
import Dropdown from 'rc-dropdown';
import React, {Component, ReactNode} from 'react';
import {Icon} from 'react-fa';

import {styled} from 'theme';

type OnGroupClickFunc = (name: string) => void;
type OnClickFunc = () => void;

const Wrapper = styled.a`
  margin-top: 3px;
  color: ${props => props.theme.text.placeholder};
  margin-right: 7px;
  font-size: 12px;
  animation: fadeIn 0.5s;

  &:hover {
    color: ${props => props.theme.text.navPlaceholder};
  }

  &.active {
    color: ${props => props.theme.text.navPlaceholder};
  }
`;

const GroupMenuLayer = styled.div`
  background-color: ${props => props.theme.light};
  border-radius: 4px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
  margin-left: -15px;
`;

const GroupMenuButton = styled.a`
  display: block;
  padding: 6px 8px;
  font-size: 10px;
  color: ${props => props.theme.text.navPlaceholder};

  span {
    position: relative;
    top: -0.5px;
    font-size: 7px;
    margin-right: 3px;

    &.red {
      color: ${props => props.theme.dangerAccent()};
    }

    &.green {
      color: ${props => props.theme.greenAccent()};
    }

    &.yellow {
      color: ${props => props.theme.alertAccent()};
    }
  }

  &:hover {
    background-color: rgba(0, 0, 0, 0.025);
  }

  &:active {
    background-color: rgba(0, 0, 0, 0.06);
  }
`;

const createGroupMenu = (
  onStartGroupClick?: OnClickFunc,
  onRestartGroupClick?: OnClickFunc,
  onStopGroupClick?: OnClickFunc,
  onCloseGroupClick?: OnClickFunc,
) => (
  <GroupMenuLayer>
    <GroupMenuButton onClick={onStartGroupClick}>
      <Icon
        className="green"
        name="play"
        style={{fontSize: '6px', marginLeft: '1px'}}
      />{' '}
      Start group
    </GroupMenuButton>
    <GroupMenuButton onClick={onRestartGroupClick}>
      <Icon className="yellow" name="repeat" /> Restart group
    </GroupMenuButton>
    <GroupMenuButton onClick={onStopGroupClick}>
      <Icon className="red" name="power-off" /> Stop group
    </GroupMenuButton>
    <GroupMenuButton onClick={onCloseGroupClick}>
      <Icon className="red" name="close" /> Close group
    </GroupMenuButton>
  </GroupMenuLayer>
);

export interface GroupNavLinkProps {
  className?: string;
  name: string;
  active?: boolean;
  onClick?: OnGroupClickFunc;
  onStartGroupClick?: OnGroupClickFunc;
  onRestartGroupClick?: OnGroupClickFunc;
  onStopGroupClick?: OnGroupClickFunc;
  onCloseGroupClick?: OnGroupClickFunc;
}

@observer
export class GroupNavLink extends Component<GroupNavLinkProps> {
  @observable
  hover = false;

  render(): ReactNode {
    let {className, name, active} = this.props;

    return (
      <Dropdown
        trigger={['contextMenu']}
        overlay={createGroupMenu(
          this.onInnerStartGroupClick,
          this.onInnerRestartGroupClick,
          this.onInnerStopGroupClick,
          this.onInnerCloseGroupClick,
        )}
        animation="slide-up"
      >
        <Wrapper
          role="button"
          className={classNames(
            'group-nav-link',
            className,
            active ? 'active' : undefined,
          )}
          onClick={this.onInnerClick}
          onMouseEnter={this.onMouseEnter}
          onMouseLeave={this.onMouseLeave}
        >
          {name.toUpperCase()}
        </Wrapper>
      </Dropdown>
    );
  }

  onInnerClick = (): void => {
    let {name, onClick} = this.props;

    if (onClick) {
      onClick(name);
    }
  };

  onInnerStartGroupClick = (): void => {
    let {name, onStartGroupClick} = this.props;

    if (onStartGroupClick) {
      onStartGroupClick(name);
    }
  };

  onInnerRestartGroupClick = (): void => {
    let {name, onRestartGroupClick} = this.props;

    if (onRestartGroupClick) {
      onRestartGroupClick(name);
    }
  };

  onInnerStopGroupClick = (): void => {
    let {name, onStopGroupClick} = this.props;

    if (onStopGroupClick) {
      onStopGroupClick(name);
    }
  };

  onInnerCloseGroupClick = (): void => {
    let {name, onCloseGroupClick} = this.props;

    if (onCloseGroupClick) {
      onCloseGroupClick(name);
    }
  };

  @action
  onMouseEnter = (): void => {
    this.hover = true;
  };

  @action
  onMouseLeave = (): void => {
    this.hover = false;
  };

  static Wrapper = Wrapper;
}
