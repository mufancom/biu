import {observer} from '@makeflow/mobx-utils';
import classNames from 'classnames';
import React, {Component, ReactNode} from 'react';
import {createDefaultToolbarButton} from 'react-mosaic-component';

import {styled} from 'theme';

const Wrapper = styled.div``;

export interface WindowRemoveButtonProps {
  className?: string;
  onClick?(): void;
}

@observer
export class WindowRemoveButton extends Component<WindowRemoveButtonProps> {
  render(): ReactNode {
    let {className} = this.props;

    return (
      <Wrapper className={classNames('window-remove-button', className)}>
        {createDefaultToolbarButton(
          'Close Window',
          'pt-icon-cross',
          this.remove,
        )}
      </Wrapper>
    );
  }

  remove = (): void => {
    let {onClick} = this.props;

    if (onClick) {
      onClick();
    }
  };

  static Wrapper = Wrapper;
}
