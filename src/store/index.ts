import { configureStore } from '@reduxjs/toolkit'
import { archiverV2Api } from './apis/archiver-v2.api'
import localeReducer from './localeSlice'
import { networkReducer } from './network/networkReducer'
import searchReducer from './searchSlice'

export const store = configureStore({
  reducer: {
    locale: localeReducer,
    search: searchReducer,
    network: networkReducer,
    [archiverV2Api.reducerPath]: archiverV2Api.reducer
  },

  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(archiverV2Api.middleware)
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
