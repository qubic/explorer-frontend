import { combineReducers } from '@reduxjs/toolkit'
import addressReducer from './addressSlice'
import blockReducer from './blockSlice'
import overviewReducer from './overviewSlice'
import richListReducer from './richListSlice'
import txReducer from './txSlice'

export const networkReducer = combineReducers({
  overview: overviewReducer,
  block: blockReducer,
  tx: txReducer,
  address: addressReducer,
  richList: richListReducer
})

export type NetworkState = ReturnType<typeof networkReducer>
