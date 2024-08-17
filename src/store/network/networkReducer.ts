import { combineReducers } from '@reduxjs/toolkit'
import addressReducer from './addressSlice'
import blockReducer from './blockSlice'
import overviewReducer from './overviewSlice'
import txReducer from './txSlice'

export const networkReducer = combineReducers({
  overview: overviewReducer,
  block: blockReducer,
  tx: txReducer,
  address: addressReducer
})

export type NetworkState = ReturnType<typeof networkReducer>
