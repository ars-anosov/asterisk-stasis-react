// https://learn.javascript.ru/websockets

// Это действие выполняю каждую секунду (reconnect Websocket если его StatusClass: 'ws-err')

import {
  WS_NEW_CREATING,
  WS_ONOPEN,
  WS_ONCLOSE,
  WS_ONERROR,
  WS_ONMESSAGE
} from '../constants/wsControlConst'

export function wsConnect(wsUrl) {

  var wsState = {
    wsLogTxt: 'Log:',
    StatusTxt: 'Start',
    StatusClass: 'ws-err'
  }

  return (dispatch) => {
    // try
    dispatch({
      type: WS_NEW_CREATING,
      payload: {}
    })

    // (+) WebSoket
    setInterval(
    () => {
      if (wsState.StatusClass === 'ws-err') {
        // Новый Websocket
        console.log('WebSocket reconnect')
        var socket = new WebSocket(wsUrl)

        socket.onopen = () => {
          // connected
          wsState.StatusClass = 'ws-ok'
          wsState.StatusTxt = 'Connected'
          dispatch({
            type: WS_ONOPEN,
            payload: {'wsClient': socket, 'wsState': wsState}
          })
        }
        
        socket.onclose = (event) => {
          if (event.wasClean) {
            // Закрыто чисто
            wsState.StatusClass = 'ws-err'
            wsState.StatusTxt = 'Connection Closed'
            dispatch({
              type: WS_ONCLOSE,
              payload: {'wsClient': socket, 'wsState': wsState}
            })
          } else {
            // например, "убит" процесс сервера
            wsState.StatusClass = 'ws-err'
            wsState.StatusTxt = 'Connection Broken'
            dispatch({
              type: WS_ONCLOSE,
              payload: {'wsClient': socket, 'wsState': wsState}
            })
          }
        }
        
        socket.onerror = (error) => {

          wsState.StatusClass = 'ws-err'
          wsState.StatusTxt = 'Connection Error'
          dispatch({
            type: WS_ONERROR,
            payload: {'wsClient': socket, 'wsState': wsState}
          })
        }

        socket.onmessage = (event) => {

          var wsResData = {}
          if (event.data) {
            wsResData = JSON.parse(event.data)

            //wsState.wsLogTxt = wsState.wsLogTxt +'\n'+ wsResData.type
            wsState.wsLogTxt = event.data
            dispatch({
              type: WS_ONMESSAGE,
              payload: {'wsClient': socket, 'wsState': wsState, 'message': wsResData }
            })
          }
    
        }

      }
    }, 1000)
    // (---) WebSoket

  }
}