import {observer} from '@makeflow/mobx-utils';
import classNames from 'classnames';
import React, {Component, ReactNode} from 'react';

import {Task} from 'services/task-service';
import {styled} from 'theme';

import {ListItem} from './@list-item';

const Wrapper = styled.div`
  padding-right: 16px;

  ${ListItem.Wrapper} {
    margin-bottom: 9px;
  }
`;

export interface ListProps {
  className?: string;
  tasks: Task[];
}

@observer
export class List extends Component<ListProps> {
  render(): ReactNode {
    let {className, tasks} = this.props;

    return (
      <Wrapper className={classNames('list', className)}>
        {tasks.map(task => (
          <ListItem key={task.name} task={task} />
        ))}
      </Wrapper>
    );
  }

  static Wrapper = Wrapper;
}
