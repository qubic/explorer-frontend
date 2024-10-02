import { envConfig } from '@app/configs'

const BASE_URL = envConfig.METRICS_API_URL

export const METRICS_API_ENDPOINTS = {
  GITHUB_STATS: `${BASE_URL}/github/stats`,
  QUBIC_STATS: `${BASE_URL}/github/qubic`
} as const

export default METRICS_API_ENDPOINTS
