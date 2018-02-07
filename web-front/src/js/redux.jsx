'use strict'

import React from 'react';
import ReactDOM from 'react-dom'

import { createStore } from 'redux'
import { Provider } from 'react-redux'

import App from './containers/App'
import configureStore from './store/configureStore'

const store = configureStore()


ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)
