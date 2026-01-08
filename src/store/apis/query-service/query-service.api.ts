import { envConfig } from '@app/configs'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type {
  GetTransactionsForIdentityRequest,
  QueryServiceResponse,
  QueryServiceTransaction
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
    })
  })
})

export const {
  useGetTransactionsForIdentityMutation,
  useGetTransactionByHashQuery,
  useGetTransactionsForTickQuery
} = rpcQueryServiceApi
