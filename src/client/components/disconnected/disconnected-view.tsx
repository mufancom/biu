import {observer} from '@makeflow/mobx-utils';
import classNames from 'classnames';
import React, {Component, ReactNode} from 'react';
import {Icon} from 'react-fa';

import {styled} from 'theme';

const Wrapper = styled.div`
  position: absolute;
  z-index: 9999;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  background-color: rgba(239, 243, 245, 0.85);
  transition: all 0.5s;
  display: flex;
  justify-content: center;
  align-items: center;

  &.hidden {
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transition: all 1s;
    transition-delay: 1s;
  }
`;

const HintBoxWrapper = styled.div`
  &.animated {
    animation: fadeUpIn 0.3s;
  }
`;

const HintBox = styled.div`
  position: relative;
  text-align: center;
  margin-bottom: 20px;
  background-color: #fff;
  padding: 60px 50px 40px 50px;
  transition: all 0.3s;

  &:before,
  &:after {
    position: absolute;
    content: '';
    top: 100px;
    bottom: 5px;
    left: 30px;
    right: 30px;
    z-index: -1;
    box-shadow: 0 0 40px 13px rgba(0, 0, 0, 0.1);
    border-radius: 100px/20px;
  }
`;

const HintIcon = styled.div`
  font-size: 60px;
  margin-bottom: 40px;
`;

const HintTitle = styled.div`
  text-align: center;
  color: ${props => props.theme.text.regular};
  margin-bottom: 15px;
`;

const HintSubtitle = styled.div`
  width: 270px;
  font-size: 13px;
  color: ${props => props.theme.text.placeholder};
`;

export interface DisconnectedViewProps {
  className?: string;
  connect?: boolean;
}

@observer
export class DisconnectedView extends Component<DisconnectedViewProps> {
  render(): ReactNode {
    let {className, connect} = this.props;

    return (
      <Wrapper
        className={classNames(
          'disconnected-view',
          className,
          connect ? 'hidden' : undefined,
        )}
      >
        <HintBoxWrapper className={!connect ? 'animated' : undefined}>
          {connect ? (
            <HintBox>
              <HintIcon>
                <Icon name="check" style={{color: '#67c23a'}} />
              </HintIcon>
              <HintTitle>Connected!</HintTitle>
              <HintSubtitle>Welcome to Biu. Start playing around!</HintSubtitle>
            </HintBox>
          ) : (
            <HintBox>
              <HintIcon>
                <Icon name="chain-broken" style={{color: '#f56c6c'}} />
              </HintIcon>
              <HintTitle>Oops, disconnected.</HintTitle>
              <HintSubtitle>
                Have you restarted Biu after editor restarting / reloading?
              </HintSubtitle>
            </HintBox>
          )}
        </HintBoxWrapper>
      </Wrapper>
    );
  }

  static Wrapper = Wrapper;
}
