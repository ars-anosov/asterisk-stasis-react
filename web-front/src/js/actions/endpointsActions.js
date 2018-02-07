import { OpenApiSwagger } from '../components/asterisk-react-component'

import {
  SWG_CONNECT_REQUEST,
  SWG_CONNECT_SUCCESS
} from '../constants/endpointsConst'

export function swgConnect(year) {

  const wsUrl =   'ws://192.168.13.97:8006'
  //const wsConn =  new WebSocket(wsUrl);
  const specUrl = 'http://192.168.13.97:8004/spec/swagger.json'
  const swg =     new OpenApiSwagger(specUrl)
  
  return (dispatch) => {
    // try
    dispatch({
      type: SWG_CONNECT_REQUEST,
      payload: {}
    })

    swg.connect((client, err) => {
      if (err) {
        // err
        console.log(err)
      }
      else {
        // connected
        dispatch({
          type: SWG_CONNECT_SUCCESS,
          payload: client
        })
        console.log('swg client NEW connection in Reducer')
      }
    })

  }
}
