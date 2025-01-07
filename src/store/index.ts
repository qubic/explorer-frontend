import { configureStore } from '@reduxjs/toolkit'

import { archiverV1Api } from './apis/archiver-v1'
import { archiverV2Api } from './apis/archiver-v2'
import { qliApi } from './apis/qli'
import { qxApi } from './apis/qx'
import localeReducer from './localeSlice'
import searchReducer from './searchSlice'

export const store = configureStore({
  reducer: {
    locale: localeReducer,
    search: searchReducer,
    [qliApi.reducerPath]: qliApi.reducer,
    [archiverV1Api.reducerPath]: archiverV1Api.reducer,
    [archiverV2Api.reducerPath]: archiverV2Api.reducer,
    [qxApi.reducerPath]: qxApi.reducer
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(qliApi.middleware)
      .concat(archiverV1Api.middleware)
      .concat(archiverV2Api.middleware)
      .concat(qxApi.middleware)
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
