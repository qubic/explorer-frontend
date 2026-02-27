import { configureStore } from '@reduxjs/toolkit'

import { eventsApi } from './apis/events'
import { archiverV2Api } from './apis/archiver-v2'
import { qliApi } from './apis/qli'
import { rpcQueryServiceApi } from './apis/query-service'
import { qubicStaticApi } from './apis/qubic-static'
import { rpcLiveApi } from './apis/rpc-live'
import { rpcStatsApi } from './apis/rpc-stats'
import localeReducer from './localeSlice'
import searchReducer from './searchSlice'

export const store = configureStore({
  reducer: {
    locale: localeReducer,
    search: searchReducer,
    [qliApi.reducerPath]: qliApi.reducer,
    [archiverV2Api.reducerPath]: archiverV2Api.reducer,
    [rpcQueryServiceApi.reducerPath]: rpcQueryServiceApi.reducer,
    [rpcLiveApi.reducerPath]: rpcLiveApi.reducer,
    [rpcStatsApi.reducerPath]: rpcStatsApi.reducer,
    [qubicStaticApi.reducerPath]: qubicStaticApi.reducer,
    [eventsApi.reducerPath]: eventsApi.reducer
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(qliApi.middleware)
      .concat(archiverV2Api.middleware)
      .concat(rpcQueryServiceApi.middleware)
      .concat(rpcLiveApi.middleware)
      .concat(rpcStatsApi.middleware)
      .concat(qubicStaticApi.middleware)
      .concat(eventsApi.middleware)
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
