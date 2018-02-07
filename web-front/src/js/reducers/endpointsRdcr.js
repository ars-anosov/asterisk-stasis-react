import {
  SWG_CONNECT_REQUEST,
  SWG_CONNECT_SUCCESS
} from '../constants/endpointsConst'

const initialState = {
  client: {},
  fetching: false
}


export default function endpointsRdcr(state = initialState, action) {

  switch (action.type) {
    case SWG_CONNECT_REQUEST:
      return { ...state, client: action.payload, fetching: true }

    case SWG_CONNECT_SUCCESS:
      return { ...state, client: action.payload, fetching: false }

    default:
      return state;
  }

}