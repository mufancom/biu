declare module 'rc-dropdown' {
  import {Component, CSSProperties} from 'react';

  type Func = (...args: any[]) => any;

  export interface DropdownProps {
    minOverlayWidthMatchTrigger?: boolean;
    onVisibleChange?: Func;
    onOverlayClick?: Func;
    prefixCls?: string;
    transitionName?: string;
    overlayClassName?: string;
    animation?: any;
    align?: object;
    overlayStyle?: CSSProperties;
    placement?: string;
    overlay?: React.ReactNode;
    trigger?: any[];
    alignPoint?: boolean;
    showAction?: any[];
    hideAction?: any[];
    getPopupContainer?: Func;
    visible?: boolean;
    defaultVisible?: boolean;
  }

  export default class Dropdown extends Component<DropdownProps> {}
}
