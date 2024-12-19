import { convertHistoricalTxToTxWithStatus } from '@app/store/adapters'
import type { TransactionWithStatus } from '@app/types'
import { createApi } from '@reduxjs/toolkit/query/react'
import { qliBaseQuery } from './qli.base-query'
import type { GetAddressHistoryQueryParams, HistoricalTx } from './qli.types'

export const qliApi = createApi({
  reducerPath: 'qliApi',
  baseQuery: qliBaseQuery,
  endpoints: (build) => ({
    // Transaction
    getQliTransaction: build.query<TransactionWithStatus, string>({
      query: (txId) => `Network/tx/${txId}`,
      transformResponse: convertHistoricalTxToTxWithStatus
    }),
    // Address
    getAddressHistory: build.query<TransactionWithStatus[], GetAddressHistoryQueryParams>({
      query: ({ addressId, page, pageSize }) =>
        `Network/IdHistory/${addressId}?page=${page}&pageSize=${pageSize}`,
      transformResponse: (response: HistoricalTx[]) =>
        response.map(convertHistoricalTxToTxWithStatus)
    })
  })
})

export const { useGetQliTransactionQuery, useLazyGetAddressHistoryQuery } = qliApi
