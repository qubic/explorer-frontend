import { combineReducers } from '@reduxjs/toolkit'
import blockReducer from './blockSlice'
import overviewReducer from './overviewSlice'

export const networkReducer = combineReducers({
  overview: overviewReducer,
  block: blockReducer
})

export type NetworkState = ReturnType<typeof networkReducer>
