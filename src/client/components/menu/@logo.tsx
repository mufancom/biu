import {observer} from '@makeflow/mobx-utils';
import classNames from 'classnames';
import React, {Component, ReactNode} from 'react';

import LogoImgSrc from 'assets/logo.svg';
import {styled} from 'theme';

const Wrapper = styled.div`
  width: 78px;
  height: 36px;
`;

const LogoImg = styled.img`
  width: 100%;
  height: 100%;
`;

export interface LogoProps {
  className?: string;
}

@observer
export class Logo extends Component<LogoProps> {
  render(): ReactNode {
    let {className} = this.props;

    return (
      <Wrapper className={classNames('logo', className)}>
        <LogoImg src={LogoImgSrc} />
      </Wrapper>
    );
  }

  static Wrapper = Wrapper;
}
