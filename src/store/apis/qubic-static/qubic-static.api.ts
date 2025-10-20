import { envConfig } from '@app/configs'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type {
  GetAddressLabelsResponse,
  GetExchangesResponse,
  GetSmartContractsResponse,
  GetTokensResponse
} from './qubic-static.types'

const BASE_URL = `${envConfig.STATIC_API_URL || 'https://static.qubic.org'}/v1/general/data`

// Cache static data for 24 hours within a browser session
// Note: Browser refresh (F5) clears Redux store and refetches fresh data
const CACHE_TIME = 86400 // 24 hours in seconds

export const qubicStaticApi = createApi({
  reducerPath: 'qubicStaticApi',
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  // Keep cached data for 24 hours (only applies within a single browser session)
  // Browser refresh will always fetch fresh data as Redux store resets
  keepUnusedDataFor: CACHE_TIME,
  endpoints: (build) => ({
    getSmartContracts: build.query<GetSmartContractsResponse['smart_contracts'], void>({
      query: () => '/smart_contracts.json',
      transformResponse: (response: GetSmartContractsResponse) => response.smart_contracts
    }),
    getExchanges: build.query<GetExchangesResponse['exchanges'], void>({
      query: () => '/exchanges.json',
      transformResponse: (response: GetExchangesResponse) => response.exchanges
    }),
    getAddressLabels: build.query<GetAddressLabelsResponse['address_labels'], void>({
      query: () => '/address_labels.json',
      transformResponse: (response: GetAddressLabelsResponse) => response.address_labels
    }),
    getTokens: build.query<GetTokensResponse['tokens'], void>({
      query: () => '/tokens.json',
      transformResponse: (response: GetTokensResponse) => response.tokens
    })
  })
})

export const {
  useGetSmartContractsQuery,
  useGetExchangesQuery,
  useGetAddressLabelsQuery,
  useGetTokensQuery
} = qubicStaticApi
