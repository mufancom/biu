import {observer} from '@makeflow/mobx-utils';
import classNames from 'classnames';
import React, {Component, ReactNode} from 'react';
import Icon from 'react-fa';

import {styled} from 'theme';

const Wrapper = styled.a`
  font-size: 11px;
  color: ${props => props.theme.bar.gray};
  opacity: 0.7;
  padding: 5px;
  cursor: pointer;

  &:hover {
    opacity: 1;
  }

  &.active {
    color: ${props => props.theme.alertAccent(0.3)};
  }
`;

export interface PinButtonProps {
  className?: string;
  pinned?: boolean;
  hide?: boolean;
  onClick?(): void;
}

@observer
export class PinButton extends Component<PinButtonProps> {
  render(): ReactNode {
    let {className, onClick, pinned, hide} = this.props;

    return (
      <Wrapper
        className={classNames(
          'pin-button',
          className,
          pinned ? 'active' : undefined,
        )}
        onClick={onClick}
      >
        <Icon
          name={!pinned && hide ? 'chevron-right' : 'thumb-tack'}
          style={!pinned && hide ? undefined : {transform: 'rotate(45deg)'}}
        />
      </Wrapper>
    );
  }

  static Wrapper = Wrapper;
}
