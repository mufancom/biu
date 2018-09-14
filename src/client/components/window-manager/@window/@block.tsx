import {observer} from '@makeflow/mobx-utils';
import classNames from 'classnames';
import React, {Component, ReactNode, createRef} from 'react';
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

const OutputWrapper = styled.div`
  padding: 7px;
  font-family: monospace;
  word-break: break-all;
`;

export interface BlockProps {
  className?: string;
  html: string;
}

@observer
export class Block extends Component<BlockProps> {
  scrollbars: React.RefObject<Scrollbars> = createRef();

  render(): ReactNode {
    let {className, html} = this.props;

    this.autoScroll();

    return (
      <Wrapper className={classNames('block', className)}>
        <Scrollbars
          ref={this.scrollbars}
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
          <OutputWrapper dangerouslySetInnerHTML={{__html: html}} />
        </Scrollbars>
      </Wrapper>
    );
  }

  autoScroll = (): void => {
    if (this.scrollbars.current) {
      let scrollbars = this.scrollbars.current;

      let height = scrollbars.getClientHeight();

      let scrollTop = scrollbars.getScrollTop();

      let scrollHeight = scrollbars.getScrollHeight();

      let offset = scrollHeight - height - scrollTop;

      if (offset < 5) {
        console.log('scrolled');

        setTimeout(() => {
          scrollbars.scrollToBottom();
        }, 100);
      }
    }
  };

  static Wrapper = Wrapper;
}
