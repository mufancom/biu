import {observer} from '@makeflow/mobx-utils';
import classNames from 'classnames';
import React, {Component, ReactNode} from 'react';

import {styled} from 'theme';

import {GroupNavLink} from './@group-nav-link';

const Wrapper = styled.div`
  &.hidden {
    display: none;
  }
`;

export interface GroupNavProps {
  className?: string;
  groupNames: string[];
  nowGroupName: string | undefined;
  onGroupNavLinkClick?(name: string): void;
}

@observer
export class GroupNav extends Component<GroupNavProps> {
  render(): ReactNode {
    let {className, groupNames, nowGroupName, onGroupNavLinkClick} = this.props;

    return (
      <Wrapper
        className={classNames(
          'group-nav',
          className,
          groupNames ? undefined : 'hidden',
        )}
      >
        {groupNames.map(name => (
          <GroupNavLink
            key={name}
            name={name}
            active={nowGroupName === name}
            onClick={onGroupNavLinkClick}
          />
        ))}
      </Wrapper>
    );
  }

  static Wrapper = Wrapper;
}
