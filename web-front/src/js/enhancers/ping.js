export const ping = store => next => action => {
  console.log(`action.type: ${action.type}, action.payload: ${action.payload}`)
  return next(action)
}

//export const ping = (store) => {
//  (next) => {
//    (action) => {
//      console.log('ping')
//      return next(action)
//    }
//  }
//}