import { envConfig } from '@app/configs'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { GetEpochTicksArgs, GetEpochTicksResponse } from './qubic-v1.types'

const BASE_URL = `${envConfig.QUBIC_API_URL}/v2`

export const qubicV1Api = createApi({
  reducerPath: 'qubicV1Api',
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  endpoints: (builder) => ({
    getEpochTicks: builder.query<GetEpochTicksResponse, GetEpochTicksArgs>({
      query: ({ epoch, pageSize, page }) =>
        `epochs/${epoch}/ticks?pageSize=${pageSize}&page=${page}`
    })
  })
})

export const { useGetEpochTicksQuery } = qubicV1Api
