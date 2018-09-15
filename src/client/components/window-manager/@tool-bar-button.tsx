import {observer} from '@makeflow/mobx-utils';
import classNames from 'classnames';
import React, {Component, ReactNode} from 'react';
import Icon from 'react-fa';

import {styled} from 'theme';

const Wrapper = styled.a`
  background-color: rgba(0, 0, 0, 0.1);
  color: ${props => props.theme.background};
  padding: 3px 5px;
  border-radius: 3px;
  margin-left: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &:hover {
    background-color: rgba(0, 0, 0, 0.2);
  }

  &:active {
    background-color: rgba(0, 0, 0, 0.3);
  }

  &.green {
    &:hover {
      background-color: ${props => props.theme.greenAccent()};
    }

    &:active {
      background-color: ${props => props.theme.greenAccent(-0.2)};
    }
  }

  &.red {
    &:hover {
      background-color: ${props => props.theme.dangerAccent()};
    }

    &:active {
      background-color: ${props => props.theme.dangerAccent(-0.2)};
    }
  }

  &.yellow {
    &:hover {
      background-color: ${props => props.theme.alertAccent(0.4)};
    }

    &:active {
      background-color: ${props => props.theme.alertAccent(0)};
    }
  }
`;

export type ToolBarButtonAccent = 'green' | 'red' | 'yellow';

export interface ToolBarButtonProps {
  className?: string;
  icon: string;
  title: string;
  accent?: ToolBarButtonAccent;
  onClick?(): void;
}

@observer
export class ToolBarButton extends Component<ToolBarButtonProps> {
  render(): ReactNode {
    let {className, icon, title, accent, onClick} = this.props;

    return (
      <Wrapper
        className={classNames('tool-bar-button', className, accent)}
        onClick={onClick}
      >
        <Icon name={icon} /> {title}
      </Wrapper>
    );
  }

  static Wrapper = Wrapper;
}
