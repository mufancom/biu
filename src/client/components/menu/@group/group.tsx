import {inject, observer} from '@makeflow/mobx-utils';
import classNames from 'classnames';
import {action, entries, observable, values} from 'mobx';
import React, {Component, ReactNode} from 'react';
import Scrollbars from 'react-custom-scrollbars';

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
  display: flex;
  flex-direction: column;
  position: relative;

  ${GroupNav.Wrapper} {
    padding: 0 10px;
    margin-bottom: 13px;
    margin-left: 10px;
    margin-right: 15px;
    flex: none;
  }
`;

const ScrollbarsWrapper = styled(Scrollbars)`
  flex: 1;
  margin-bottom: 20px;
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
          onGroupNavStartGroupClick={this.onGroupNavStartGroupClick}
          onGroupNavRestartGroupClick={this.onGroupNavRestartGroupClick}
          onGroupNavStopGroupClick={this.onGroupNavStopGroupClick}
          onGroupNavCloseGroupClick={this.onGroupNavCloseGroupClick}
        />
        <ScrollbarsWrapper autoHide autoHideTimeout={300}>
          <List group={this.nowGroupName} tasks={nowGroupTasks} />
        </ScrollbarsWrapper>
      </Wrapper>
    );
  }

  getNowGroupTasks = (groupDict: TaskGroupDict, taskDict: TaskDict): Task[] => {
    let keys = Object.keys(groupDict);

    let tasks: Task[] = [];

    let nowGroupName = this.nowGroupName;

    if (keys.length && nowGroupName) {
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
    if (this.nowGroupName === name) {
      this.nowGroupName = undefined;
    } else {
      this.nowGroupName = name;
    }
  };

  onGroupNavStartGroupClick = (name: string): void => {
    this.taskService.startGroup(name);
  };

  onGroupNavRestartGroupClick = (name: string): void => {
    this.taskService.restartGroup(name);
  };

  onGroupNavStopGroupClick = (name: string): void => {
    this.taskService.stopGroup(name);
  };

  onGroupNavCloseGroupClick = (name: string): void => {
    this.taskService.closeGroup(name);
  };

  static Wrapper = Wrapper;
}
