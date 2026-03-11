import { createApi } from '@reduxjs/toolkit/query/react'
import { qliBaseQuery } from './qli.base-query'
import type { TickQualityResponse } from './qli.types'

export const qliApi = createApi({
  reducerPath: 'qliApi',
  baseQuery: qliBaseQuery,
  endpoints: (build) => ({
    // Tick Quality stats
    getTickQuality: build.query<TickQualityResponse, void>({
      query: () => 'public/TickQuality'
    })
  })
})

export const { useGetTickQualityQuery } = qliApi
