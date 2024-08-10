import { combineReducers } from '@reduxjs/toolkit'
import blockReducer from './blockSlice'
import overviewReducer from './overviewSlice'
import txReducer from './txSlice'

export const networkReducer = combineReducers({
  overview: overviewReducer,
  block: blockReducer,
  tx: txReducer
})

export type NetworkState = ReturnType<typeof networkReducer>
