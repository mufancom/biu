import {observer} from '@makeflow/mobx-utils';
import classNames from 'classnames';
import React, {Component, ReactNode} from 'react';

import {styled} from 'theme';

const Wrapper = styled.div`
  background-color: ${props => props.theme.washedOutBlack};
`;

export interface BlockProps {
  className?: string;
}

@observer
export class Block extends Component<BlockProps> {
  render(): ReactNode {
    let {className} = this.props;

    return <Wrapper className={classNames('block', className)}>block</Wrapper>;
  }

  static Wrapper = Wrapper;
}
