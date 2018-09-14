import {observer} from '@makeflow/mobx-utils';
import classNames from 'classnames';
import React, {Component, ReactNode} from 'react';
import {Icon} from 'react-fa';

import {styled} from 'theme';

const Wrapper = styled.a`
  color: ${props => props.theme.bar.gray};
  transition: all 0.3s;
  cursor: pointer;
  font-size: 10px;
  padding: 2px;
  margin-top: 9px;
  margin-left: 3px;

  &:hover {
    color: ${props => props.theme.safeAccent()};
    transition: all 0.3s;
  }
`;

export interface WindowStartButtonProps {
  className?: string;
  onClick?(): void;
}

@observer
export class WindowStartButton extends Component<WindowStartButtonProps> {
  render(): ReactNode {
    let {className, onClick} = this.props;

    return (
      <Wrapper
        className={classNames('window-start-button', className)}
        onClick={onClick}
        title="Start"
      >
        <Icon name="play" />
      </Wrapper>
    );
  }

  static Wrapper = Wrapper;
}
