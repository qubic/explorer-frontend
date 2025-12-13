import { envConfig } from '@app/configs'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { GetEpochComputorsResponse, GetTickDataResponse } from './archiver-v1.types'

const BASE_URL = `${envConfig.QUBIC_RPC_URL}/v1`

export const archiverV1Api = createApi({
  reducerPath: 'archiverV1Api',
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  endpoints: (build) => ({
    // Tick
    getTickData: build.query<GetTickDataResponse['tickData'], { tick: number }>({
      query: ({ tick }) => `/ticks/${tick}/tick-data`,
      transformResponse: (response: GetTickDataResponse) => response.tickData
    }),
    // Epoch
    getEpochComputors: build.query<GetEpochComputorsResponse['computors'], { epoch: number }>({
      query: ({ epoch }) => `/epochs/${epoch}/computors`,
      transformResponse: (response: GetEpochComputorsResponse) => response.computors
    })
  })
})

export const {
  // Tick
  useGetTickDataQuery,
  // Epoch
  useGetEpochComputorsQuery
} = archiverV1Api
