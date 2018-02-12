import { combineReducers }  from 'redux'
import endpointsRdcr        from './endpointsRdcr'
import wsControlRdcr        from './wsControlRdcr'
import swgControlRdcr       from './swgControlRdcr'

export default combineReducers({
  endpointsRdcr,
  wsControlRdcr,
  swgControlRdcr
})