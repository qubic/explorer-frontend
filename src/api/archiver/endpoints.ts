import envConfig from '@app/configs/envConfig'

const BASE_URL = envConfig.ARCHIVER_API_URL

const ARCHIVER_API_ENDPOINTS = {
  BALANCES: (query: string) => `${BASE_URL}/balances/${query}`,
  TRANSACTIONS: (query: string) => `${BASE_URL}/transactions/${query}`,
  TICKS: (query: string) => `${BASE_URL}/ticks/${parseInt(query.replace(/,/g, ''), 10)}/tick-data`
} as const

export default ARCHIVER_API_ENDPOINTS
