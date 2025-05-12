import type { TransactionWithType } from '@app/types'
import { createApi } from '@reduxjs/toolkit/query/react'
import { convertQliTxToTxWithType } from './qli.adapters'
import { qliBaseQuery } from './qli.base-query'
import type { GetAddressHistoryQueryParams, HistoricalTx, TickQualityResponse } from './qli.types'

export const qliApi = createApi({
  reducerPath: 'qliApi',
  baseQuery: qliBaseQuery,
  endpoints: (build) => ({
    // Transaction
    getQliTransaction: build.query<TransactionWithType, string>({
      query: (txId) => `Network/tx/${txId}`,
      transformResponse: convertQliTxToTxWithType
    }),
    // Address
    getAddressHistory: build.query<TransactionWithType[], GetAddressHistoryQueryParams>({
      query: ({ addressId, page, pageSize }) =>
        `Network/IdHistory/${addressId}?page=${page}&pageSize=${pageSize}`,
      transformResponse: (response: HistoricalTx[]) => response.map(convertQliTxToTxWithType)
    }),
    // Tick Quality stats
    getTickQuality: build.query<TickQualityResponse, void>({
      query: () => 'public/TickQuality'
    })
  })
})

export const { useGetQliTransactionQuery, useLazyGetAddressHistoryQuery, useGetTickQualityQuery } =
  qliApi
