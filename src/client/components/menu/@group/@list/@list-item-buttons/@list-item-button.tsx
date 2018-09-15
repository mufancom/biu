import {observer} from '@makeflow/mobx-utils';
import classNames from 'classnames';
import React, {Component, ReactNode} from 'react';
import {Icon} from 'react-fa';

import {styled} from 'theme';

const Wrapper = styled.a`
  color: ${props => props.theme.border.light};
  cursor: pointer;

  &.red {
    color: ${props => props.theme.dangerAccent()};

    &:hover {
      color: ${props => props.theme.dangerAccent(-0.2)};
    }
  }

  &.hover-red:hover {
    color: ${props => props.theme.dangerAccent()};
  }

  &.hover-yellow:hover {
    color: ${props => props.theme.alertAccent(0.6)};
  }

  &.hover-blue:hover {
    color: ${props => props.theme.accent()};
  }

  &.hover-green:hover {
    color: ${props => props.theme.safeAccent()};
  }
`;

export interface ListItemButtonProps {
  className?: string;
  icon: string;
  title?: string;
  onClick?(): void;
}

@observer
export class ListItemButton extends Component<ListItemButtonProps> {
  render(): ReactNode {
    let {className, icon, title} = this.props;

    return (
      <Wrapper
        className={classNames('list-item-button', className)}
        onClick={this.onInnerClick}
        title={title}
      >
        <Icon name={icon} />
      </Wrapper>
    );
  }

  onInnerClick = (event: React.MouseEvent): void => {
    event.preventDefault();
    event.stopPropagation();

    let {onClick} = this.props;

    if (onClick) {
      onClick();
    }
  };

  static Wrapper = Wrapper;
}
