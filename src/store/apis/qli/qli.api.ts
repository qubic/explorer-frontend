import { createApi } from '@reduxjs/toolkit/query/react'
import type { Transaction } from '../archiver-v2'
import { convertQliTxToArchiverTx } from './qli.adapters'
import { qliBaseQuery } from './qli.base-query'
import type { GetAddressHistoryQueryParams, HistoricalTx, TickQualityResponse } from './qli.types'

export const qliApi = createApi({
  reducerPath: 'qliApi',
  baseQuery: qliBaseQuery,
  endpoints: (build) => ({
    // Transaction
    getQliTransaction: build.query<Transaction, string>({
      query: (txId) => `Network/tx/${txId}`,
      transformResponse: convertQliTxToArchiverTx
    }),
    // Address
    getAddressHistory: build.query<Transaction[], GetAddressHistoryQueryParams>({
      query: ({ addressId, page, pageSize }) =>
        `Network/IdHistory/${addressId}?page=${page}&pageSize=${pageSize}`,
      transformResponse: (response: HistoricalTx[]) => response.map(convertQliTxToArchiverTx)
    }),
    // Tick Quality stats
    getTickQuality: build.query<TickQualityResponse, void>({
      query: () => 'public/TickQuality'
    })
  })
})

export const { useGetQliTransactionQuery, useLazyGetAddressHistoryQuery, useGetTickQualityQuery } =
  qliApi
