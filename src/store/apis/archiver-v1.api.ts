import { envConfig } from '@app/configs'
import type { GetTickDataResponse } from '@app/services/archiver'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { GetEpochComputorsResponse, GetLatestStatsResponse } from './archiver-v1.types'

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
    })
  })
})

export const { useGetLatestStatsQuery, useGetTickDataQuery, useGetEpochComputorsQuery } =
  archiverV1Api
