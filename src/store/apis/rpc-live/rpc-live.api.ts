import { envConfig } from '@app/configs'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type {
  GetAddressBalancesResponse,
  GetAssetsIssuancesResponse,
  GetIssuedAssetsResponse,
  GetOwnedAssetsResponse,
  GetPossessedAssetsResponse,
  GetTickInfoResponse
} from './rpc-live.types'

const BASE_URL = `${envConfig.QUBIC_RPC_URL}/live/v1`

export const rpcLiveApi = createApi({
  reducerPath: 'rpcLiveApi',
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  endpoints: (build) => ({
    // Tick Info
    getTickInfo: build.query<GetTickInfoResponse['tickInfo'], void>({
      query: () => '/tick-info',
      transformResponse: (response: GetTickInfoResponse) => response.tickInfo
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
    })
  })
})

export const {
  // Tick Info
  useGetTickInfoQuery,
  // Address
  useGetAddressBalancesQuery,
  useLazyGetAddressBalancesQuery,
  // Address Assets
  useGetAddressIssuedAssetsQuery,
  useGetAddressOwnedAssetsQuery,
  useGetAddressPossessedAssetsQuery,
  // Assets
  useGetAssetsIssuancesQuery
} = rpcLiveApi
