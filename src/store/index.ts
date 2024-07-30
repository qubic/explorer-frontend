import { configureStore } from '@reduxjs/toolkit'
import blockReducer from './blockSlice'
import localeReducer from './localeSlice'
import overviewReducer from './overviewSlice'
import searchReducer from './searchSlice'

export const store = configureStore({
  reducer: {
    locale: localeReducer,
    search: searchReducer,
    // Network reducers
    overview: overviewReducer,
    block: blockReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
