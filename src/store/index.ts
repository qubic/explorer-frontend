import { configureStore } from '@reduxjs/toolkit'
import localeReducer from './localeSlice'
import overviewReducer from './overviewSlice'
import searchReducer from './searchSlice'

export const store = configureStore({
  reducer: {
    locale: localeReducer,
    search: searchReducer,
    overview: overviewReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
