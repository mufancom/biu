import {observer} from '@makeflow/mobx-utils';
import classNames from 'classnames';
import React, {Component, ReactNode} from 'react';

import {TaskStatus} from 'services/task-service';
import {styled} from 'theme';

const Wrapper = styled.div`
  border-radius: 2.5px;
  width: 5px;
  height: 5px;
  display: block;
  transition: all 0.2s;

  &.running {
    background-color: ${props => props.theme.bar.green};
  }

  &.waiting {
    background-color: ${props => props.theme.bar.yellow};
  }

  &.stopped {
    background-color: ${props => props.theme.bar.gray};
  }
`;

export interface WindowStatusDotProps {
  className?: string;
  status: TaskStatus;
}

@observer
export class WindowStatusDot extends Component<WindowStatusDotProps> {
  render(): ReactNode {
    let {className, status} = this.props;

    let statusClassName = getStatusClassName(status);

    return (
      <Wrapper
        className={classNames('window-status-dot', className, statusClassName)}
      />
    );
  }

  static Wrapper = Wrapper;
}

function getStatusClassName(status: TaskStatus): string | undefined {
  switch (status) {
    case TaskStatus.running:
      return 'running';
    case TaskStatus.stopped:
      return 'stopped';
    case TaskStatus.stopping:
    case TaskStatus.restarting:
      return 'waiting';
  }

  return undefined;
}
