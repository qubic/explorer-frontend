import { envConfig } from '@app/configs'
import axios from 'axios'
import { METRICS_API_ENDPOINTS } from './endpoints'
import type {
  GithubStatsHistory,
  GithubStatsOverview,
  QubicLIScoresStats,
  QubicStats
} from './types'

const fetchData = async <T>(url: string): Promise<T> => {
  try {
    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${envConfig.METRICS_API_TOKEN}`
      }
    })
    return response.data as T
  } catch (error) {
    throw new Error(`Failed to fetch data from ${url}: ${(error as Error).message}`)
  }
}

const metricsApiService = {
  getQubicStats: async (range: string | null): Promise<{ data: QubicStats[] }> => {
    const url = METRICS_API_ENDPOINTS.QUBIC_STATS
    return fetchData<{ data: QubicStats[] }>(`${url}?range=${range || 'ALL'}`)
  },
  getQubicLiquidityScoresStats: async (
    range: string | null
  ): Promise<{ data: QubicLIScoresStats[] }> => {
    const url = METRICS_API_ENDPOINTS.QUBIC_LI_SCORES_STATS
    return fetchData<{ data: QubicLIScoresStats[]; totalCount: number }>(
      `${url}?range=${range || 'ALL'}`
    )
  },
  getGithubStatsOverview: async (range: string | null): Promise<{ data: GithubStatsOverview }> => {
    const url = METRICS_API_ENDPOINTS.GITHUB_STATS_OVERVIEW
    return fetchData<{ data: GithubStatsOverview }>(`${url}?range=${range || 'ALL'}`)
  },
  getGithubStatsHistory: async (range: string | null): Promise<{ data: GithubStatsHistory[] }> => {
    const url = METRICS_API_ENDPOINTS.GITHUB_STATS_HISTORY
    return fetchData<{ data: GithubStatsHistory[] }>(`${url}?range=${range || 'ALL'}`)
  }
}

export default metricsApiService
