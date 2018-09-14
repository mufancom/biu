import {observer} from '@makeflow/mobx-utils';
import classNames from 'classnames';
import React, {Component, ReactNode} from 'react';
import ScrollHorizontal from 'react-scroll-horizontal';

import {styled} from 'theme';

import {GroupNavLink} from './@group-nav-link';

const Wrapper = styled.div`
  height: 17px;

  &.hidden {
    display: none;
  }

  .scroll-horizontal-restricted {
    & > div {
      min-width: 100%;
    }
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
          groupNames && groupNames.length ? undefined : 'hidden',
        )}
      >
        <ScrollHorizontal
          reverseScroll
          className="scroll-horizontal-restricted"
        >
          {groupNames.map(name => (
            <GroupNavLink
              key={name}
              name={name}
              active={nowGroupName === name}
              onClick={onGroupNavLinkClick}
            />
          ))}
        </ScrollHorizontal>
      </Wrapper>
    );
  }

  static Wrapper = Wrapper;
}
