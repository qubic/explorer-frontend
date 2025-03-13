import { envConfig } from '@app/configs'
import type { TransactionWithType } from '@app/types'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { convertArchiverTxToTxWithType } from './archiver-v2.adapters'
import type {
  GetEpochTicksArgs,
  GetEpochTicksResponse,
  GetIdentityTransfersArgs,
  GetIdentityTransfersResponse,
  GetTickTransactionsArgs,
  GetTickTransactionsResponse
} from './archiver-v2.types'

const BASE_URL = `${envConfig.ARCHIVER_API_URL}/v2`

export const archiverV2Api = createApi({
  reducerPath: 'archiverV2Api',
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  endpoints: (builder) => ({
    // Transactions
    getTransaction: builder.query<TransactionWithType, string>({
      query: (txId) => `transactions/${txId}`,
      transformResponse: convertArchiverTxToTxWithType
    }),
    // Identity Transfers
    getIndentityTransfers: builder.query<
      {
        pagination: GetIdentityTransfersResponse['pagination']
        transactions: GetIdentityTransfersResponse['transactions'][0]['transactions']
      },
      GetIdentityTransfersArgs
    >({
      query: ({ addressId, startTick, endTick, page, pageSize }) =>
        `identities/${addressId}/transfers?startTick=${startTick}&endTick=${endTick}&page=${page}&pageSize=${pageSize}&desc=true`,
      transformResponse: (response: GetIdentityTransfersResponse) => ({
        pagination: response.pagination,
        transactions: response.transactions.flatMap(({ transactions }) => transactions)
      })
    }),
    // Tick Transactions
    getTickTransactions: builder.query<
      GetTickTransactionsResponse['transactions'],
      GetTickTransactionsArgs
    >({
      query: ({ tick, transfers = false, approved = false }) =>
        `ticks/${tick}/transactions?transfers=${transfers}&approved=${approved}`,
      transformResponse: (response: GetTickTransactionsResponse) => response.transactions
    }),
    // Epoch Ticks
    getEpochTicks: builder.query<GetEpochTicksResponse, GetEpochTicksArgs>({
      query: ({ epoch, pageSize, page }) =>
        `epochs/${epoch}/ticks?desc=true&pageSize=${pageSize}&page=${page}`
    })
  })
})

export const {
  // Transactions
  useGetTransactionQuery,
  // Identity Transfers
  useLazyGetIndentityTransfersQuery,
  // Tick Transactions
  useGetTickTransactionsQuery,
  // Epoch Ticks
  useGetEpochTicksQuery
} = archiverV2Api
