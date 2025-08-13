import { configureStore } from '@reduxjs/toolkit'

import { archiverV1Api } from './apis/archiver-v1'
import { archiverV2Api } from './apis/archiver-v2'
import { qliApi } from './apis/qli'
import { testnetQubicRpcV1 } from './apis/testnet-qubic-rpc-v1'
import localeReducer from './localeSlice'
import searchReducer from './searchSlice'
import turnstileReducer from './turnstileSlice'

export const store = configureStore({
  reducer: {
    locale: localeReducer,
    search: searchReducer,
    turnstile: turnstileReducer,
    [qliApi.reducerPath]: qliApi.reducer,
    [archiverV1Api.reducerPath]: archiverV1Api.reducer,
    [archiverV2Api.reducerPath]: archiverV2Api.reducer,
    [testnetQubicRpcV1.reducerPath]: testnetQubicRpcV1.reducer
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(qliApi.middleware)
      .concat(archiverV1Api.middleware)
      .concat(archiverV2Api.middleware)
      .concat(testnetQubicRpcV1.middleware)
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
