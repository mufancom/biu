import {observer} from '@makeflow/mobx-utils';
import classNames from 'classnames';
import React, {Component, ReactNode} from 'react';
import ScrollHorizontal from 'react-scroll-horizontal';

import {styled} from 'theme';

import {GroupNavLink} from './@group-nav-link';

const Wrapper = styled.div`
  height: 20px;

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
  onGroupNavStartGroupClick?(name: string): void;
  onGroupNavRestartGroupClick?(name: string): void;
  onGroupNavStopGroupClick?(name: string): void;
  onGroupNavCloseGroupClick?(name: string): void;
}

@observer
export class GroupNav extends Component<GroupNavProps> {
  render(): ReactNode {
    let {
      className,
      groupNames,
      nowGroupName,
      onGroupNavLinkClick,
      onGroupNavStartGroupClick,
      onGroupNavRestartGroupClick,
      onGroupNavStopGroupClick,
      onGroupNavCloseGroupClick,
    } = this.props;

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
              onStartGroupClick={onGroupNavStartGroupClick}
              onRestartGroupClick={onGroupNavRestartGroupClick}
              onStopGroupClick={onGroupNavStopGroupClick}
              onCloseGroupClick={onGroupNavCloseGroupClick}
            />
          ))}
        </ScrollHorizontal>
      </Wrapper>
    );
  }

  static Wrapper = Wrapper;
}
