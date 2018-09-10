import {Provider} from 'mobx-react';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as services from './services';
import {App} from './views/app';

ReactDOM.render(
  <Provider {...services}>
    <App />
  </Provider>,
  document.getElementById('root') as HTMLElement,
);
