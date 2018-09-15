import {observer} from '@makeflow/mobx-utils';
import classNames from 'classnames';
import React, {Component, ReactNode} from 'react';

import {styled} from 'theme';

const Wrapper = styled.a`
  color: ${props => props.theme.text.placeholder};
  margin-right: 7px;
  font-size: 12px;
  cursor: pointer;
  user-select: none;
  animation: fadeIn 0.5s;

  &:hover {
    color: ${props => props.theme.text.navPlaceholder};
  }

  &.active {
    color: ${props => props.theme.text.navPlaceholder};
  }
`;

export interface GroupNavLinkProps {
  className?: string;
  name: string;
  active?: boolean;
  onClick?(name: string): void;
}

@observer
export class GroupNavLink extends Component<GroupNavLinkProps> {
  render(): ReactNode {
    let {className, name, active} = this.props;

    return (
      <Wrapper
        className={classNames(
          'group-nav-link',
          className,
          active ? 'active' : undefined,
        )}
        onClick={this.onInnerClick}
      >
        {name.toUpperCase()}
      </Wrapper>
    );
  }

  onInnerClick = (): void => {
    let {name, onClick} = this.props;

    if (onClick) {
      onClick(name);
    }
  };

  static Wrapper = Wrapper;
}
