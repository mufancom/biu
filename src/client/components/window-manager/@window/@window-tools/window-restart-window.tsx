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
    color: ${props => props.theme.alertAccent(0.6)};
    transition: all 0.3s;
  }
`;

export interface WindowRestartButtonProps {
  className?: string;
  onClick?(): void;
}

@observer
export class WindowRestartButton extends Component<WindowRestartButtonProps> {
  render(): ReactNode {
    let {className, onClick} = this.props;

    return (
      <Wrapper
        className={classNames('window-restart-button', className)}
        onClick={onClick}
        title="Restart"
      >
        <Icon name="repeat" />
      </Wrapper>
    );
  }

  static Wrapper = Wrapper;
}
