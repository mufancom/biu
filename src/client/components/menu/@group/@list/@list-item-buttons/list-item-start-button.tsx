import {observer} from '@makeflow/mobx-utils';
import classNames from 'classnames';
import React, {Component, ReactNode} from 'react';

import {styled} from 'theme';

import {ListItemButton} from './@list-item-button';

const Wrapper = styled.div`
  margin-left: 5px;
  display: inline;
`;

export interface ListItemStartButtonProps {
  className?: string;
  onClick?(): void;
}

@observer
export class ListItemStartButton extends Component<ListItemStartButtonProps> {
  render(): ReactNode {
    let {className, onClick} = this.props;

    return (
      <Wrapper className={classNames('list-item-start', className)}>
        <ListItemButton className="hover-green" icon="play" onClick={onClick} />
      </Wrapper>
    );
  }

  static Wrapper = Wrapper;
}
