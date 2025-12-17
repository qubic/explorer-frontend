import { configureStore } from '@reduxjs/toolkit'

import { archiverV1Api } from './apis/archiver-v1'
import { archiverV2Api } from './apis/archiver-v2'
import { qliApi } from './apis/qli'
import { rpcQueryServiceApi } from './apis/query-service/query-service.api'
import { qubicStaticApi } from './apis/qubic-static'
import { rpcLiveApi } from './apis/rpc-live'
import { rpcStatsApi } from './apis/rpc-stats'
import { testnetQubicRpcV1 } from './apis/testnet-qubic-rpc-v1'
import localeReducer from './localeSlice'
import searchReducer from './searchSlice'

export const store = configureStore({
  reducer: {
    locale: localeReducer,
    search: searchReducer,
    [qliApi.reducerPath]: qliApi.reducer,
    [archiverV1Api.reducerPath]: archiverV1Api.reducer,
    [archiverV2Api.reducerPath]: archiverV2Api.reducer,
    [rpcQueryServiceApi.reducerPath]: rpcQueryServiceApi.reducer,
    [rpcLiveApi.reducerPath]: rpcLiveApi.reducer,
    [rpcStatsApi.reducerPath]: rpcStatsApi.reducer,
    [testnetQubicRpcV1.reducerPath]: testnetQubicRpcV1.reducer,
    [qubicStaticApi.reducerPath]: qubicStaticApi.reducer
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(qliApi.middleware)
      .concat(archiverV1Api.middleware)
      .concat(archiverV2Api.middleware)
      .concat(rpcQueryServiceApi.middleware)
      .concat(rpcLiveApi.middleware)
      .concat(rpcStatsApi.middleware)
      .concat(testnetQubicRpcV1.middleware)
      .concat(qubicStaticApi.middleware)
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
