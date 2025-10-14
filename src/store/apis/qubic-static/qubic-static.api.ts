import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type {
  GetAddressLabelsResponse,
  GetExchangesResponse,
  GetSmartContractsResponse,
  GetTokensResponse
} from './qubic-static.types'

const BASE_URL = import.meta.env.VITE_STATIC_API_URL || 'https://static.qubic.org/general/data/v1'

// Cache time in seconds (5 minutes)
const CACHE_TIME = 300

export const qubicStaticApi = createApi({
  reducerPath: 'qubicStaticApi',
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  // Keep cached data for 5 minutes
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
