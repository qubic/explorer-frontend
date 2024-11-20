import { envConfig } from '@app/configs'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type {
  GithubStatsHistory,
  GithubStatsOverview,
  QubicLIScoresStats,
  QubicLIStats,
  QubicStats
} from './metrics-v1.types'

const BASE_URL = `${envConfig.METRICS_API_URL}/stats`

export const metricsV1Api = createApi({
  reducerPath: 'metricsV1Api',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      headers.set('Authorization', `Bearer ${envConfig.METRICS_API_TOKEN}`)
      return headers
    }
  }),
  endpoints: (build) => ({
    getQubicStats: build.query<QubicStats[], string | null>({
      query: (range) => `/qubic/history?range=${range || 'ALL'}`,
      transformResponse: (response: { data: QubicStats[] }) => response.data
    }),
    getQubicLIStats: build.query<
      QubicLIStats[],
      { range: string | null; timeline?: 'hourly' | 'daily' | 'weekly' | 'minute' }
    >({
      query: ({ range, timeline = 'minute' }) =>
        `/qubic-li/stats?timelineBy=${timeline}&range=${range || 'ALL'}`,
      transformResponse: (response: { data: QubicLIStats[] }) => response.data
    }),
    getQubicLIScoresHistory: build.query<
      QubicLIScoresStats[],
      { range: string | null; timeline?: 'hourly' | 'daily' | 'weekly' | '5min' }
    >({
      query: ({ range, timeline = 'daily' }) =>
        `/qubic-li/scores?timelineBy=${timeline}&range=${range || 'ALL'}`,
      transformResponse: (response: { data: QubicLIScoresStats[] }) => response.data
    }),
    getGithubStatsOverview: build.query<GithubStatsOverview, string | null>({
      query: (range) => `/github?range=${range || 'ALL'}`,
      transformResponse: (response: { data: GithubStatsOverview }) => response.data
    }),
    getGithubStatsHistory: build.query<GithubStatsHistory[], string | null>({
      query: (range) => `/github/history?range=${range || 'ALL'}`,
      transformResponse: (response: { data: GithubStatsHistory[] }) => response.data
    })
  })
})

export const {
  useGetQubicStatsQuery,
  useGetQubicLIStatsQuery,
  useGetQubicLIScoresHistoryQuery,
  useGetGithubStatsOverviewQuery,
  useGetGithubStatsHistoryQuery
} = metricsV1Api
