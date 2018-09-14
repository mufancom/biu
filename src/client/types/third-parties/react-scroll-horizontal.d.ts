declare module 'react-scroll-horizontal' {
  import {Component, CSSProperties} from 'react';

  export interface ScrollHorizontalConfig {
    stiffness?: number;
    damping?: number;
  }

  export interface ScrollHorizontalProps {
    reverseScroll?: boolean;
    pageLock?: boolean;
    config?: ScrollHorizontalConfig;
    style?: CSSProperties;
    className?: string;
  }

  export default class ScrollHorizontal extends Component<
    ScrollHorizontalProps
  > {}
}
