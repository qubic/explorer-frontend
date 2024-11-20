import { configureStore } from '@reduxjs/toolkit'
import { archiverV1Api } from './apis/archiver-v1.api'
import { archiverV2Api } from './apis/archiver-v2.api'
import { metricsV1Api } from './apis/metrics-v1.api'
import localeReducer from './localeSlice'
import { networkReducer } from './network/networkReducer'
import searchReducer from './searchSlice'

export const store = configureStore({
  reducer: {
    locale: localeReducer,
    search: searchReducer,
    network: networkReducer,
    [archiverV1Api.reducerPath]: archiverV1Api.reducer,
    [archiverV2Api.reducerPath]: archiverV2Api.reducer,
    [metricsV1Api.reducerPath]: metricsV1Api.reducer
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(archiverV1Api.middleware)
      .concat(archiverV2Api.middleware)
      .concat(metricsV1Api.middleware)
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
