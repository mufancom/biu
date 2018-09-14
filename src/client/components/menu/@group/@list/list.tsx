import {observer} from '@makeflow/mobx-utils';
import classNames from 'classnames';
import React, {Component, ReactNode} from 'react';
import FlipMove from 'react-flip-move';

import {Task} from 'services/task-service';
import {styled} from 'theme';
import {fadeInUpAnimation} from 'utils/dom';

import {ListItem} from './@list-item';

const Wrapper = styled.div`
  padding-right: 16px;
  padding-left: 10px;

  ${ListItem.Wrapper} {
    margin-bottom: 9px;
  }
`;

export interface ListProps {
  className?: string;
  group: string | undefined;
  tasks: Task[];
}

@observer
export class List extends Component<ListProps> {
  render(): ReactNode {
    let {className, tasks, group} = this.props;

    return (
      <Wrapper className={classNames('list', className)}>
        <FlipMove
          enterAnimation={fadeInUpAnimation}
          leaveAnimation={false}
          duration={300}
          staggerDurationBy={60}
        >
          {tasks.map(task => (
            <ListItem key={group + task.name} task={task} />
          ))}
        </FlipMove>
      </Wrapper>
    );
  }

  static Wrapper = Wrapper;
}
