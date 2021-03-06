'use strict'

import React from 'react';
import ReactDOM from 'react-dom'
import { OpenApiSwagger, ChannelsMonitor, WsControl, Endpoints } from './components/asterisk-react-component'

window.localStorage.setItem('token', 'test')


const wsUrl =   'ws://192.168.13.97:8006'
//const wsConn =  new WebSocket(wsUrl);
const specUrl = 'http://192.168.13.97:8004/spec/swagger.json'
const swg =     new OpenApiSwagger(specUrl)

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
        <Endpoints swgClient={client} headerTxt='Endpoints component' />
        <ChannelsMonitor swgClient={client} headerTxt='ChannelsMonitor component' />
        <WsControl wsUrl={wsUrl} headerTxt='WsControl component' />
      </div>,
      document.getElementById('root')
    )
  }
})