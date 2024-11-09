import { envConfig } from '@app/configs'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type {
  GetIdentityTransfersArgs,
  GetIdentityTransfersResponse,
  GetTickTransactionsArgs,
  GetTickTransactionsResponse,
  GetTransactionResponse
} from './archiver-v2.types'

const BASE_URL = `${envConfig.ARCHIVER_API_URL}/v2`

export const archiverV2Api = createApi({
  reducerPath: 'archiverV2Api',
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  endpoints: (builder) => ({
    getTransaction: builder.query<GetTransactionResponse, string>({
      query: (txId) => `transactions/${txId}`
    }),
    getIndentityTransfers: builder.query<
      GetIdentityTransfersResponse['transactions'][0]['transactions'],
      GetIdentityTransfersArgs
    >({
      query: ({ addressId, startTick, endTick }) =>
        `identities/${addressId}/transfers?startTick=${startTick}&endTick=${endTick}`,
      transformResponse: (response: GetIdentityTransfersResponse) =>
        response.transactions.flatMap(({ transactions }) => transactions)
    }),
    getTickTransactions: builder.query<
      GetTickTransactionsResponse['transactions'],
      GetTickTransactionsArgs
    >({
      query: ({ tick, transfers = false, approved = false }) =>
        `ticks/${tick}/transactions?transfers=${transfers}&approved=${approved}`,
      transformResponse: (response: GetTickTransactionsResponse) => response.transactions
    })
  })
})

export const {
  useGetTransactionQuery,
  useGetIndentityTransfersQuery,
  useLazyGetIndentityTransfersQuery,
  useGetTickTransactionsQuery
} = archiverV2Api
