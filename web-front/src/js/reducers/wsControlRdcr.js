import {
  WS_NEW_CREATING,
  WS_ONOPEN,
  WS_ONCLOSE,
  WS_ONERROR,
  WS_ONMESSAGE
} from '../constants/wsControlConst'

const initialState = {
  wsClient: {},
  wsState: {
    wsLogTxt: 'Log:',
    wsStatusTxt: 'Start',
    wsStatusClass: 'ws-err'
  },
  message: {}
}


export default function wsControlRdcr(state = initialState, action) {

  switch (action.type) {
    case WS_NEW_CREATING:
      return { ...state, wsState: action.payload.wsState }

    case WS_ONOPEN:
      return { ...state, wsClient: action.payload.wsClient, wsState: action.payload.wsState }

    case WS_ONCLOSE:
      return { ...state, wsState: action.payload.wsState }

    case WS_ONERROR:
      return { ...state, wsState: action.payload.wsState }

    case WS_ONMESSAGE:
      return { ...state, wsState: action.payload.wsState, message: action.payload.message }

    default:
      return state;
  }

}