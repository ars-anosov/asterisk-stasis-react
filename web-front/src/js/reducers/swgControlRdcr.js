import {
  SWG_CONNECT_REQUEST,
  SWG_CONNECT_SUCCESS
} from '../constants/swgControlConst'

const initialState = {
  swgClient: {},
  swgState: {StatusTxt: 'Start', StatusClass: 'swg-err'}
}


export default function swgControlRdcr(state = initialState, action) {

  switch (action.type) {
    case SWG_CONNECT_REQUEST:
      return { ...state, swgState: {StatusTxt: 'Trying', StatusClass: 'swg-try'} }

    case SWG_CONNECT_SUCCESS:
      return { ...state, swgClient: action.payload.swgClient, swgState: {StatusTxt: 'Connected', StatusClass: 'swg-ok'} }

    default:
      return state;
  }

}