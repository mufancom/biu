import {Provider} from 'mobx-react';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {ThemeProvider} from 'styled-components';

import {App} from 'components/app';

import './global.css';
import * as services from './services';
import {theme} from './theme';

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <Provider {...services}>
      <App />
    </Provider>
  </ThemeProvider>,
  document.getElementById('root') as HTMLElement,
);
