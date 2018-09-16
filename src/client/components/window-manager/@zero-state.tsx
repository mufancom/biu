import {observer} from '@makeflow/mobx-utils';
import classNames from 'classnames';
import React, {Component, ReactNode} from 'react';

import ZeroStateImage from 'assets/zero-state.svg';
import {styled} from 'theme';

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ZeroStateBox = styled.div`
  padding-bottom: 30px;
  text-align: center;
  animation: fadeUpIn 0.5s;
`;

const ZeroStateImg = styled.img`
  width: 200px;
  margin-bottom: 40px;
`;

const ZeroStateTitle = styled.div`
  text-align: center;
  color: #414b55;
  margin-bottom: 10px;
`;

const ZeroStateSubtitle = styled.div`
  font-size: 13px;
  color: #96a1aa;
`;

export interface ZeroStateProps {
  className?: string;
}

@observer
export class ZeroState extends Component<ZeroStateProps> {
  render(): ReactNode {
    let {className} = this.props;

    return (
      <Wrapper className={classNames('zero-state', className)}>
        <ZeroStateBox>
          <ZeroStateImg src={ZeroStateImage} />
          <ZeroStateTitle>No Tasks</ZeroStateTitle>
          <ZeroStateSubtitle>
            Click on items on the left to run a few tasks!
          </ZeroStateSubtitle>
        </ZeroStateBox>
      </Wrapper>
    );
  }

  static Wrapper = Wrapper;
}
