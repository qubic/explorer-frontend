import { envConfig } from '@app/configs'

const BASE_URL = envConfig.METRICS_API_URL

export const METRICS_API_ENDPOINTS = {
  GITHUB_STATS: `${BASE_URL}/stats/github`,
  GITHUB_STATS_HISTORY: `${BASE_URL}/stats/github/history`,
  GITHUB_STATS_OVERVIEW: `${BASE_URL}/stats/github/overview`,
  QUBIC_STATS: `${BASE_URL}/stats/qubic`
} as const

export default METRICS_API_ENDPOINTS
