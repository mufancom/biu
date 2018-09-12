import {observer} from '@makeflow/mobx-utils';
import classNames from 'classnames';
import React, {Component, ReactNode} from 'react';

import {styled} from 'theme';

import {ListItemButton} from './@list-item-button';

const Wrapper = styled.div`
  margin-left: 5px;
  display: inline;
`;

export interface ListItemRestartButtonProps {
  className?: string;
  onClick?(): void;
}

@observer
export class ListItemRestartButton extends Component<
  ListItemRestartButtonProps
> {
  render(): ReactNode {
    let {className, onClick} = this.props;

    return (
      <Wrapper className={classNames('list-item-restart-button', className)}>
        <ListItemButton
          className="hover-yellow"
          icon="repeat"
          onClick={onClick}
        />
      </Wrapper>
    );
  }

  static Wrapper = Wrapper;
}
