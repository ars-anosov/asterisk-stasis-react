import OpenApiSwagger from 'swagger-client'

import {
  SWG_CONNECT_REQUEST,
  SWG_CONNECT_SUCCESS
} from '../constants/swgControlConst'

export function swgConnect(specUrl) {
  
  return (dispatch) => {
    // try
    dispatch({
      type: SWG_CONNECT_REQUEST,
      payload: {'swgClient': {}}
    })

    OpenApiSwagger(specUrl)
      .then(
        (client) => {
          // connected
          dispatch({
            type: SWG_CONNECT_SUCCESS,
            payload: {'swgClient': client}
          })
          console.log('swg client NEW connection in Reducer')
        }
      )
      .catch(
        (err) => {
          // err
          console.log(err)
        }
      )

  }
}
