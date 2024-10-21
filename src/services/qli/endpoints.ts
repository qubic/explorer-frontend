import { envConfig } from '@app/configs'

const BASE_URL = envConfig.QLI_API_URL

export const QLI_API_ENDPOINTS = {
  LOGIN: `${BASE_URL}/Auth/Login`,
  // NETWORK
  TICK_OVERVIEW: `${BASE_URL}/Network/TickOverview`,
  TX: (txId: string) => `${BASE_URL}/Network/tx/${txId}`,
  ADDRESS: (addressId: string) => `${BASE_URL}/Network/Id/${addressId}`,
  ADDRESS_HISTORY: (addressId: string, page = 1, pageSize = 50) =>
    `${BASE_URL}/Network/IdHistory/${addressId}?page=${page}&pageSize=${pageSize}`,
  // WALLET
  ADDRESS_ASSETS: `${BASE_URL}/Wallet/Assets`
} as const

export default QLI_API_ENDPOINTS
