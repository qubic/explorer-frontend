import { combineReducers } from '@reduxjs/toolkit'
import addressReducer from './addressSlice'
import txReducer from './txSlice'

export const networkReducer = combineReducers({
  tx: txReducer,
  address: addressReducer
})

export type NetworkState = ReturnType<typeof networkReducer>
