import envConfig from '@app/configs/envConfig'

const BASE_URL = envConfig.QLI_API_URL

const QLI_API_ENDPOINTS = {
  LOGIN: `${BASE_URL}/Auth/Login`,
  TICK_OVERVIEW: `${BASE_URL}/Network/TickOverview`
} as const

export default QLI_API_ENDPOINTS
