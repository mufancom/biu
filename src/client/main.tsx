import {Provider} from 'mobx-react';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import {App} from 'components/app';

import './global.css';
import * as services from './services';

ReactDOM.render(
  <Provider {...services}>
    <App />
  </Provider>,
  document.getElementById('root') as HTMLElement,
);
