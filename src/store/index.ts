import { configureStore } from '@reduxjs/toolkit'
import localeReducer from './localeSlice'
import { networkReducer } from './network/networkReducer'
import searchReducer from './searchSlice'

export const store = configureStore({
  reducer: {
    locale: localeReducer,
    search: searchReducer,
    network: networkReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
