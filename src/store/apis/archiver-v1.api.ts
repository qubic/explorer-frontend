import { envConfig } from '@app/configs'
import type { GetTickDataResponse } from '@app/services/archiver'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type {
  GetAddressBalancesResponse,
  GetEpochComputorsResponse,
  GetIssuedAssetsResponse,
  GetLatestStatsResponse,
  GetOwnedAssetsResponse,
  GetPossessedAssetsResponse,
  GetRichListResponse
} from './archiver-v1.types'

const BASE_URL = `${envConfig.ARCHIVER_API_URL}/v1`

export const archiverV1Api = createApi({
  reducerPath: 'archiverV1Api',
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  endpoints: (build) => ({
    getLatestStats: build.query<GetLatestStatsResponse['data'], void>({
      query: () => '/latest-stats',
      transformResponse: (response: GetLatestStatsResponse) => response.data
    }),
    getTickData: build.query<GetTickDataResponse['tickData'], { tick: number }>({
      query: ({ tick }) => `/ticks/${tick}/tick-data`,
      transformResponse: (response: GetTickDataResponse) => response.tickData
    }),
    getEpochComputors: build.query<GetEpochComputorsResponse['computors'], { epoch: number }>({
      query: ({ epoch }) => `/epochs/${epoch}/computors`,
      transformResponse: (response: GetEpochComputorsResponse) => response.computors
    }),
    getRickList: build.query<GetRichListResponse, { page: number; pageSize: number }>({
      query: ({ page, pageSize }) => `/rich-list?page=${page}&pageSize=${pageSize}`
    }),
    // Address
    getAddressBalances: build.query<GetAddressBalancesResponse['balance'], { address: string }>({
      query: ({ address }) => `/balances/${address}`,
      transformResponse: (response: GetAddressBalancesResponse) => response.balance
    }),
    // Address Assets
    getAddressIssuedAssets: build.query<
      GetIssuedAssetsResponse['issuedAssets'],
      { address: string }
    >({
      query: ({ address }) => `/assets/${address}/issued`,
      transformResponse: (response: GetIssuedAssetsResponse) => response.issuedAssets
    }),
    getAddressOwnedAssets: build.query<GetOwnedAssetsResponse['ownedAssets'], { address: string }>({
      query: ({ address }) => `/assets/${address}/owned`,
      transformResponse: (response: GetOwnedAssetsResponse) => response.ownedAssets
    }),
    getAddressPossessedAssets: build.query<
      GetPossessedAssetsResponse['possessedAssets'],
      { address: string }
    >({
      query: ({ address }) => `/assets/${address}/possessed`,
      transformResponse: (response: GetPossessedAssetsResponse) => response.possessedAssets
    })
  })
})

export const {
  useGetLatestStatsQuery,
  useGetTickDataQuery,
  useGetEpochComputorsQuery,
  useGetRickListQuery,
  // Address
  useGetAddressBalancesQuery,
  // Address Assets
  useGetAddressIssuedAssetsQuery,
  useGetAddressOwnedAssetsQuery,
  useGetAddressPossessedAssetsQuery
} = archiverV1Api
