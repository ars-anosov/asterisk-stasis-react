import { createStore, applyMiddleware } from 'redux'
import rootReducer from '../reducers/rootReducer'

//import { ping } from '../enhancers/ping'
import { createLogger } from 'redux-logger'

import thunk from 'redux-thunk'

export default function configureStore(initialState) {
  const logger = createLogger()

  const store = createStore(
    rootReducer,
    initialState,
    applyMiddleware(thunk, logger)
    //applyMiddleware(thunk)
  )
  
  return store
}
