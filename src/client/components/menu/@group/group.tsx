import {inject, observer} from '@makeflow/mobx-utils';
import classNames from 'classnames';
import {action, entries, observable, values} from 'mobx';
import React, {Component, ReactNode} from 'react';

import {
  Task,
  TaskDict,
  TaskGroupDict,
  TaskService,
} from 'services/task-service';
import {styled} from 'theme';

import {GroupNav} from './@group-nav';
import {List} from './@list';

const Wrapper = styled.div`
  ${GroupNav.Wrapper} {
    padding: 0 10px;
    margin-bottom: 13px;
  }
`;

export interface GroupProps {
  className?: string;
}

@observer
export class Group extends Component<GroupProps> {
  @inject
  taskService!: TaskService;

  @observable
  nowGroupName: string | undefined;

  render(): ReactNode {
    let {className} = this.props;

    let groups = this.taskService.taskGroups;

    let keys = Object.keys(groups);

    let nowGroupTasks = this.getNowGroupTasks(groups, this.taskService.tasks);

    return (
      <Wrapper className={classNames('group', className)}>
        <GroupNav
          groupNames={keys}
          nowGroupName={this.nowGroupName}
          onGroupNavLinkClick={this.onGroupNavLinkClick}
        />
        <List tasks={nowGroupTasks} />
      </Wrapper>
    );
  }

  getNowGroupTasks = (groupDict: TaskGroupDict, taskDict: TaskDict): Task[] => {
    let keys = Object.keys(groupDict);

    let tasks: Task[] = [];

    if (keys.length) {
      let nowGroupName = this.nowGroupName;

      if (!nowGroupName) {
        nowGroupName = keys[0];
      }

      let nowGroupTaskNames = groupDict[nowGroupName];

      for (let [key, task] of entries(taskDict)) {
        if (nowGroupTaskNames.includes(key)) {
          tasks.push(task);
        }
      }
    } else {
      for (let task of values(this.taskService.tasks)) {
        tasks.push(task);
      }
    }

    return tasks;
  };

  @action
  onGroupNavLinkClick = (name: string): void => {
    this.nowGroupName = name;
  };

  static Wrapper = Wrapper;
}
