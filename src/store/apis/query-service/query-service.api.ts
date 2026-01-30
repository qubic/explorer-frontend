import { envConfig } from '@app/configs'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type {
  ComputorList,
  GetComputorListsForEpochResponse,
  GetTickDataResponse,
  GetTransactionsForIdentityRequest,
  QueryServiceResponse,
  QueryServiceTransaction,
  TickData
} from './query-service.types'

const BASE_URL = `${envConfig.QUBIC_RPC_URL}/query/v1`

export const rpcQueryServiceApi = createApi({
  reducerPath: 'rpcQueryServiceApi',
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  endpoints: (builder) => ({
    getTransactionsForIdentity: builder.mutation<
      QueryServiceResponse,
      GetTransactionsForIdentityRequest
    >({
      query: (body) => ({
        url: '/getTransactionsForIdentity',
        method: 'POST',
        body
      })
    }),
    getTransactionByHash: builder.query<QueryServiceTransaction, string>({
      query: (hash) => ({
        url: '/getTransactionByHash',
        method: 'POST',
        body: { hash }
      })
    }),
    getTransactionsForTick: builder.query<QueryServiceTransaction[], number>({
      query: (tickNumber) => ({
        url: '/getTransactionsForTick',
        method: 'POST',
        body: { tickNumber }
      })
    }),
    getTickData: builder.query<TickData, number>({
      query: (tickNumber) => ({
        url: '/getTickData',
        method: 'POST',
        body: { tickNumber }
      }),
      transformResponse: (response: GetTickDataResponse) => response.tickData
    }),
    getComputorListsForEpoch: builder.query<ComputorList[], number>({
      query: (epoch) => ({
        url: '/getComputorListsForEpoch',
        method: 'POST',
        body: { epoch }
      }),
      transformResponse: (response: GetComputorListsForEpochResponse) => response.computorsLists
    })
  })
})

export const {
  useGetTransactionsForIdentityMutation,
  useGetTransactionByHashQuery,
  useGetTransactionsForTickQuery,
  useGetTickDataQuery,
  useGetComputorListsForEpochQuery
} = rpcQueryServiceApi
