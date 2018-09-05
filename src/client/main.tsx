import {Provider} from 'mobx-react';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import {App} from './views/app';

ReactDOM.render(
  <Provider>
    <App />
  </Provider>,
  document.getElementById('root') as HTMLElement,
);
