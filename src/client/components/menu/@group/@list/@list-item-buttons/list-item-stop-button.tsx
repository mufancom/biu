import {observer} from '@makeflow/mobx-utils';
import classNames from 'classnames';
import React, {Component, ReactNode} from 'react';

import {styled} from 'theme';

import {ListItemButton} from './@list-item-button';

const Wrapper = styled.div`
  margin-left: 5px;
  display: inline;
`;

export interface ListItemStopButtonProps {
  className?: string;
  onClick?(): void;
}

@observer
export class ListItemStopButton extends Component<ListItemStopButtonProps> {
  render(): ReactNode {
    let {className, onClick} = this.props;

    return (
      <Wrapper className={classNames('list-item-stop-button', className)}>
        <ListItemButton
          className="hover-red"
          icon="power-off"
          onClick={onClick}
        />
      </Wrapper>
    );
  }

  static Wrapper = Wrapper;
}
