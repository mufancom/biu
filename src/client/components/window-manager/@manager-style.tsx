import {styled} from 'theme';

export const ManagerStyle = styled.div`
  .mosaic {
    height: 100%;
    width: 100%;
  }
  .mosaic,
  .mosaic > * {
    box-sizing: border-box;
  }
  .mosaic .mosaic-zero-state {
    width: auto;
    height: auto;
    max-width: none;
    z-index: 1;
  }
  .mosaic .mosaic-zero-state .pt-non-ideal-state-icon .pt-icon {
    font-size: 120px;
  }
  .mosaic-root {
    position: absolute;
    top: 3px;
    right: 3px;
    bottom: 3px;
    left: 3px;
  }
  .mosaic-split {
    position: absolute;
    z-index: 1;
    transition: all 0.1s;
  }
  .mosaic-split:hover {
    transition: all 0.1s;

    background: rgba(0, 0, 0, 0.2);
  }
  .mosaic-split .mosaic-split-line {
    position: absolute;
  }
  .mosaic-split.-row {
    margin-left: -2px;
    width: 4px;
    cursor: ew-resize;
  }
  .mosaic-split.-row .mosaic-split-line {
    top: 0;
    bottom: 0;
    left: 3px;
    right: 3px;
  }
  .mosaic-split.-column {
    margin-top: -2px;
    height: 4px;
    cursor: ns-resize;
  }
  .mosaic-split.-column .mosaic-split-line {
    top: 3px;
    bottom: 3px;
    left: 0;
    right: 0;
  }
  .mosaic-tile {
    position: absolute;
    margin: 10px;
  }
  .mosaic-tile > * {
    height: 100%;
    width: 100%;
  }
  .mosaic-drop-target {
    position: relative;
  }
  .mosaic-drop-target.drop-target-hover .drop-target-container {
    display: block;
  }
  .mosaic-drop-target.mosaic > .drop-target-container .drop-target.left {
    right: calc(100% - 10px);
  }
  .mosaic-drop-target.mosaic > .drop-target-container .drop-target.right {
    left: calc(100% - 10px);
  }
  .mosaic-drop-target.mosaic > .drop-target-container .drop-target.bottom {
    top: calc(100% - 10px);
  }
  .mosaic-drop-target.mosaic > .drop-target-container .drop-target.top {
    bottom: calc(100% - 10px);
  }
  .mosaic-drop-target .drop-target-container {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    display: none;
  }
  .mosaic-drop-target .drop-target-container.-dragging {
    display: block;
  }
  .mosaic-drop-target .drop-target-container .drop-target {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: rgba(0, 0, 0, 0.2);
    border: 2px solid rgba(0, 0, 0, 0.5);
    opacity: 0;
    transition: all 0.3s;
    z-index: 8;
    border-radius: 4px;
  }
  .mosaic-drop-target .drop-target-container .drop-target.left {
    right: calc(100% - 30%);
  }
  .mosaic-drop-target .drop-target-container .drop-target.right {
    left: calc(100% - 30%);
  }
  .mosaic-drop-target .drop-target-container .drop-target.bottom {
    top: calc(100% - 30%);
  }
  .mosaic-drop-target .drop-target-container .drop-target.top {
    bottom: calc(100% - 30%);
  }
  .mosaic-drop-target .drop-target-container .drop-target.drop-target-hover {
    opacity: 1;
  }
  .mosaic-drop-target
    .drop-target-container
    .drop-target.drop-target-hover.left {
    right: calc(100% - 50%);
  }
  .mosaic-drop-target
    .drop-target-container
    .drop-target.drop-target-hover.right {
    left: calc(100% - 50%);
  }
  .mosaic-drop-target
    .drop-target-container
    .drop-target.drop-target-hover.bottom {
    top: calc(100% - 50%);
  }
  .mosaic-drop-target
    .drop-target-container
    .drop-target.drop-target-hover.top {
    bottom: calc(100% - 50%);
  }

  /* Window style */

  .mosaic-window,
  .mosaic-preview {
    position: relative;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.08);
    border-radius: 4px;
  }
  .mosaic-window .mosaic-window-toolbar,
  .mosaic-preview .mosaic-window-toolbar {
    z-index: 4;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;
    height: 35px;
    background: white;
  }
  .mosaic-window .mosaic-window-toolbar.draggable,
  .mosaic-preview .mosaic-window-toolbar.draggable {
    cursor: move;
  }
  .mosaic-window .mosaic-window-title,
  .mosaic-preview .mosaic-window-title {
    padding-left: 15px;
    flex: 1;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    min-height: 16px;
    font-size: 13px;
    color: ${props => props.theme.text.navPlaceholder};
  }
  .mosaic-window .mosaic-window-controls,
  .mosaic-preview .mosaic-window-controls {
    display: flex;
    height: 100%;
  }
  .mosaic-window .mosaic-window-controls .separator,
  .mosaic-preview .mosaic-window-controls .separator {
    height: 20px;
    border-left: 1px solid black;
    margin: 5px 4px;
  }
  .mosaic-window .mosaic-window-body,
  .mosaic-preview .mosaic-window-body {
    flex: 1;
    height: 0;
    background: white;
    z-index: 6;
    overflow: hidden;
  }
  .mosaic-window .mosaic-window-additional-actions-bar,
  .mosaic-preview .mosaic-window-additional-actions-bar {
    position: absolute;
    top: 30px;
    right: 0;
    bottom: initial;
    left: 0;
    height: 0;
    overflow: hidden;
    background: white;
    justify-content: flex-end;
    display: flex;
    z-index: 3;
  }
  .mosaic-window .mosaic-window-additional-actions-bar .pt-button,
  .mosaic-preview .mosaic-window-additional-actions-bar .pt-button {
    margin: 0;
  }
  .mosaic-window .mosaic-window-additional-actions-bar .pt-button:after,
  .mosaic-preview .mosaic-window-additional-actions-bar .pt-button:after {
    display: none;
  }
  .mosaic-window .mosaic-window-body-overlay,
  .mosaic-preview .mosaic-window-body-overlay {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    opacity: 0;
    background: white;
    display: none;
    z-index: 2;
  }
  .mosaic-window.additional-controls-open .mosaic-window-additional-actions-bar,
  .mosaic-preview.additional-controls-open
    .mosaic-window-additional-actions-bar {
    height: 30px;
  }
  .mosaic-window.additional-controls-open .mosaic-window-body-overlay,
  .mosaic-preview.additional-controls-open .mosaic-window-body-overlay {
    display: block;
  }
  .mosaic-window .mosaic-preview,
  .mosaic-preview .mosaic-preview {
    height: 100%;
    width: 100%;
    position: absolute;
    z-index: 0;
    max-height: 400px;
  }
  .mosaic-window .mosaic-preview .mosaic-window-body,
  .mosaic-preview .mosaic-preview .mosaic-window-body {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .mosaic-window .mosaic-preview h4,
  .mosaic-preview .mosaic-preview h4 {
    margin-bottom: 10px;
  }
  .mosaic-window .mosaic-preview .pt-icon,
  .mosaic-preview .mosaic-preview .pt-icon {
    font-size: 72px;
  }

  .mosaic-window-controls.pt-button-group {
    padding-right: 10px;
  }

  .mosaic-default-control.pt-button {
    width: 12px;
    height: 12px;
    border-radius: 6px;
    border: 0px;
    padding: 5px;
    margin-top: 11px;
    margin-left: 7px;
    outline: none;
    transition: all 0.3s;
    position: relative;
    cursor: pointer;

    &::before {
      display: inline-block;
      font: normal normal normal 14px/1 FontAwesome;
      font-size: inherit;
      text-rendering: auto;
      -webkit-font-smoothing: antialiased;
      opacity: 0;
      transition: all 0.3s;
      color: #000;
      font-size: 9px;
      position: absolute;
      left: 1px;
      top: 0;
      right: 0;
      bottom: 0;
      text-align: center;
      line-height: 12.8px;
    }

    &:hover::before {
      opacity: 0.35;
    }

    &.pt-icon-cross {
      background-color: ${props => props.theme.dangerAccent()};
      &::before {
        content: '\f00d';
      }
    }

    &.pt-icon-maximize {
      background-color: ${props => props.theme.greenAccent()};

      &::before {
        content: '\f067';
      }
    }
  }
`;
