import { envConfig } from '@app/configs'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type {
  GetTickInfoResponse,
  type GetAddressBalancesResponse,
  type GetAssetsIssuancesResponse,
  type GetAssetsRichListResponse,
  type GetEpochComputorsResponse,
  type GetIssuedAssetsResponse,
  type GetLatestStatsResponse,
  type GetOwnedAssetsResponse,
  type GetPossessedAssetsResponse,
  type GetRichListResponse,
  type GetTickDataResponse
} from './archiver-v1.types'

const BASE_URL = `${envConfig.QUBIC_RPC_URL}/v1`

export const archiverV1Api = createApi({
  reducerPath: 'archiverV1Api',
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  endpoints: (build) => ({
    // General
    getLatestStats: build.query<GetLatestStatsResponse['data'], void>({
      query: () => '/latest-stats',
      transformResponse: (response: GetLatestStatsResponse) => response.data
    }),
    // Rich List
    getRichList: build.query<GetRichListResponse, { page: number; pageSize: number }>({
      query: ({ page, pageSize }) => `/rich-list?page=${page}&pageSize=${pageSize}`
    }),
    getAssetsRichList: build.query<
      GetAssetsRichListResponse,
      { issuer: string; asset: string; page: number; pageSize: number }
    >({
      query: ({ issuer, asset, page, pageSize }) =>
        `/issuers/${issuer}/assets/${asset}/owners?page=${page}&pageSize=${pageSize}`
    }),
    // Tick
    getTickData: build.query<GetTickDataResponse['tickData'], { tick: number }>({
      query: ({ tick }) => `/ticks/${tick}/tick-data`,
      transformResponse: (response: GetTickDataResponse) => response.tickData
    }),
    // Epoch
    getEpochComputors: build.query<GetEpochComputorsResponse['computors'], { epoch: number }>({
      query: ({ epoch }) => `/epochs/${epoch}/computors`,
      transformResponse: (response: GetEpochComputorsResponse) => response.computors
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
    }),
    // Assets
    getAssetsIssuances: build.query<
      GetAssetsIssuancesResponse,
      { issuerIdentity?: string; assetName?: string } | void
    >({
      query: ({ issuerIdentity, assetName } = {}) => ({
        url: '/assets/issuances',
        params: { issuerIdentity, assetName }
      })
    }),
    getTickInfo: build.query<GetTickInfoResponse['tickInfo'], void>({
      query: () => '/tick-info',
      transformResponse: (response: GetTickInfoResponse) => response.tickInfo
    })
  })
})

export const {
  // General
  useGetLatestStatsQuery,
  // Rich Lists
  useGetRichListQuery,
  useGetAssetsRichListQuery,
  // Tick
  useGetTickDataQuery,
  // Epoch
  useGetEpochComputorsQuery,
  // Address
  useGetAddressBalancesQuery,
  useLazyGetAddressBalancesQuery,
  // Address Assets
  useGetAddressIssuedAssetsQuery,
  useGetAddressOwnedAssetsQuery,
  useGetAddressPossessedAssetsQuery,
  // Assets
  useGetAssetsIssuancesQuery,
  // tick info
  useGetTickInfoQuery
} = archiverV1Api
