import {observer} from '@makeflow/mobx-utils';
import classNames from 'classnames';
import React, {Component, ReactNode} from 'react';

import {styled} from 'theme';

import {ListItemButton} from './@list-item-button';

const Wrapper = styled.div`
  margin-left: 5px;
  display: inline;
`;

export interface ListItemCloseButtonProps {
  className?: string;
  onClick?(): void;
}

@observer
export class ListItemCloseButton extends Component<ListItemCloseButtonProps> {
  render(): ReactNode {
    let {className, onClick} = this.props;

    return (
      <Wrapper className={classNames('list-item-close-button', className)}>
        <ListItemButton
          className="red"
          icon="close"
          onClick={onClick}
          title="Close"
        />
      </Wrapper>
    );
  }

  static Wrapper = Wrapper;
}
