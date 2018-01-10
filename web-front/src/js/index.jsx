'use strict'

import React from 'react';
import ReactDOM from 'react-dom'
import { OpenApiSwagger, HZ123 } from './components/asterisk-react-component'

window.localStorage.setItem('token', 'test')


const specUrl = 'http://192.168.13.97:8004/spec/swagger.json'
const swg = new OpenApiSwagger(specUrl)

swg.connect((client, err) => {
  if (err) {
    ReactDOM.render(
      <div className='std-win'>no spec - <a href={specUrl}>{specUrl}</a> !</div>,
      document.getElementById('root')
    )
  }
  else {
    ReactDOM.render(
      <div>
        <HZ123 swgClient={client} headerTxt='HZ123 component' />
      </div>,
      document.getElementById('root')
    )
  }
})