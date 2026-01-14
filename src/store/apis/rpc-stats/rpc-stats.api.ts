import { envConfig } from '@app/configs'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type {
  GetAssetsRichListResponse,
  GetLatestStatsResponse,
  GetRichListResponse
} from './rpc-stats.types'

const BASE_URL = `${envConfig.QUBIC_RPC_URL}/v1`

export const rpcStatsApi = createApi({
  reducerPath: 'rpcStatsApi',
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
    })
  })
})

export const {
  // General
  useGetLatestStatsQuery,
  // Rich Lists
  useGetRichListQuery,
  useGetAssetsRichListQuery
} = rpcStatsApi
