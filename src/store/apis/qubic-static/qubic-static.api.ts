import { envConfig } from '@app/configs'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type {
  ExplorerTranslations,
  GetAddressLabelsResponse,
  GetExchangesResponse,
  GetSmartContractsResponse,
  GetTokenCategoriesResponse,
  GetTokensResponse
} from './qubic-static.types'

const STATIC_BASE_URL = envConfig.STATIC_API_URL
const GENERAL_DATA_URL = `/v1/general/data`
const EXPLORER_DATA_URL = `/v1/explorer`

// Cache static data for 24 hours within a browser session
// Note: Browser refresh (F5) clears Redux store and refetches fresh data
const CACHE_TIME = 86400 // 24 hours in seconds

export const qubicStaticApi = createApi({
  reducerPath: 'qubicStaticApi',
  baseQuery: fetchBaseQuery({ baseUrl: STATIC_BASE_URL }),
  // Keep cached data for 24 hours (only applies within a single browser session)
  // Browser refresh will always fetch fresh data as Redux store resets
  keepUnusedDataFor: CACHE_TIME,
  endpoints: (build) => ({
    getSmartContracts: build.query<GetSmartContractsResponse['smart_contracts'], void>({
      query: () => `${GENERAL_DATA_URL}/smart_contracts.json`,
      transformResponse: (response: GetSmartContractsResponse) => response.smart_contracts
    }),
    getExchanges: build.query<GetExchangesResponse['exchanges'], void>({
      query: () => `${GENERAL_DATA_URL}/exchanges.json`,
      transformResponse: (response: GetExchangesResponse) => response.exchanges
    }),
    getAddressLabels: build.query<GetAddressLabelsResponse['address_labels'], void>({
      query: () => `${GENERAL_DATA_URL}/address_labels.json`,
      transformResponse: (response: GetAddressLabelsResponse) => response.address_labels
    }),
    getTokens: build.query<GetTokensResponse['tokens'], void>({
      query: () => `${GENERAL_DATA_URL}/tokens.json`,
      transformResponse: (response: GetTokensResponse) => response.tokens
    }),
    getTokenCategories: build.query<GetTokenCategoriesResponse, void>({
      query: () => `${EXPLORER_DATA_URL}/token_categories.json`
    }),
    getExplorerTranslations: build.query<ExplorerTranslations, string>({
      query: (lang) => `${EXPLORER_DATA_URL}/locales/${lang}.json`
    })
  })
})

export const {
  useGetSmartContractsQuery,
  useGetExchangesQuery,
  useGetAddressLabelsQuery,
  useGetTokensQuery,
  useGetTokenCategoriesQuery,
  useGetExplorerTranslationsQuery
} = qubicStaticApi
