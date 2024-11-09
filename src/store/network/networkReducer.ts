import { combineReducers } from '@reduxjs/toolkit'
import addressReducer from './addressSlice'
import overviewReducer from './overviewSlice'
import richListReducer from './richListSlice'
import txReducer from './txSlice'

export const networkReducer = combineReducers({
  overview: overviewReducer,
  tx: txReducer,
  address: addressReducer,
  richList: richListReducer
})

export type NetworkState = ReturnType<typeof networkReducer>
