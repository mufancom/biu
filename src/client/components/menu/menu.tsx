import {observer} from '@makeflow/mobx-utils';
import classNames from 'classnames';
import React, {Component, ReactNode} from 'react';

import {styled} from 'theme';

const Wrapper = styled.div`
  background-color: ${props => props.theme.light};
`;

export interface MenuProps {
  className?: string;
}

@observer
export class Menu extends Component<MenuProps> {
  render(): ReactNode {
    let {className} = this.props;

    return <Wrapper className={classNames('menu', className)}>Menu</Wrapper>;
  }

  static Wrapper = Wrapper;
}
