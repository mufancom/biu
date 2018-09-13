import {observer} from '@makeflow/mobx-utils';
import classNames from 'classnames';
import React, {Component, ReactNode} from 'react';
import Scrollbars from 'react-custom-scrollbars';

import {styled} from 'theme';

const Wrapper = styled.div`
  background-color: ${props => props.theme.washedOutBlack};
  width: 100%;
  height: 100%;
  color: ${props => props.theme.text.placeholder};
  font-size: 12px;

  .custom-scroll-bar-track {
    position: absolute;
    width: 6px;
    transition: opacity 200ms ease 0s;
    opacity: 0;
    right: 2px;
    bottom: 6px;
    top: 6px;
    border-radius: 3px;
  }

  .custom-scroll-bar-thumb {
    position: relative;
    display: block;
    width: 100%;
    cursor: pointer;
    border-radius: inherit;
    background-color: rgba(255, 255, 255, 0.2);
    right: 2px;
  }
`;

const ScrollbarsWrapper = styled(Scrollbars)``;

const OutputWrapper = styled.div`
  padding: 7px;
  word-break: break-all;
`;

export interface BlockProps {
  className?: string;
}

@observer
export class Block extends Component<BlockProps> {
  render(): ReactNode {
    let {className} = this.props;

    return (
      <Wrapper className={classNames('block', className)}>
        <ScrollbarsWrapper
          autoHide
          autoHideTimeout={300}
          renderTrackVertical={(props, styles) => (
            <div
              {...props}
              className="custom-scroll-bar-track"
              style={{...styles}}
            />
          )}
          renderThumbVertical={(props, styles) => (
            <div
              {...props}
              className="custom-scroll-bar-thumb"
              style={{...styles}}
            />
          )}
        >
          <OutputWrapper>
            > Block
            <br />
            bLSASD
            <br />
            bLSASD
            <br />
            bLSASD
            <br />
            bLSASD
            <br />
            bLSASD
            <br />
            bLSASD
            <br />
            bLSASD
            <br />
            bLSASD
            <br />
            bLSASD
            <br />
            bLSASD
            <br />
            bLSASD
            <br />
            bLSASD
            <br />
            bLSASD
            <br />
            bLSASD
            <br />
            bLSASD
            <br />
            bLSASD LSASD
            <br />
            bLSASD
            <br />
            bLSASD
            <br />
            bLSASD
            <br />
            bLSASD
            <br />
            bLSASD
            <br />
            bLSASD
            <br />
            bLSASD
            <br />
            bLSASD
            <br />
            bLSASD
            <br />
            bLSASD
            <br />
            bLSASD
          </OutputWrapper>
        </ScrollbarsWrapper>
      </Wrapper>
    );
  }

  static Wrapper = Wrapper;
}
