import axios, { type Method } from 'axios'
import { QLI_API_ENDPOINTS } from './endpoints'
import type { Address, Asset, HistoricalTx, TickOverview } from './types'

const makeApiRequest = async <T>(
  url: string,
  method: Method = 'GET',
  data?: unknown
): Promise<T> => {
  try {
    const token = window.localStorage.getItem('jwt_access_token')

    if (!token) {
      throw new Error('Error: Missing access token')
    }

    const response = await axios({
      url,
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: method !== 'GET' ? data : undefined
    })

    return response.data as T
  } catch (error) {
    throw new Error(`Failed to ${method} data from ${url}: ${(error as Error).message}`)
  }
}

const qliApiService = {
  getTickOverview: async (): Promise<TickOverview> => {
    const url = QLI_API_ENDPOINTS.TICK_OVERVIEW
    return makeApiRequest<TickOverview>(url)
  },
  getTransaction: async (txId: string): Promise<HistoricalTx> => {
    const url = QLI_API_ENDPOINTS.TX(txId)
    return makeApiRequest<HistoricalTx>(url)
  },
  getAddress: async (addressId: string): Promise<Address> => {
    const url = QLI_API_ENDPOINTS.ADDRESS(addressId)
    return makeApiRequest<Address>(url)
  },
  getAddressHistory: async (addressId: string, page: number): Promise<HistoricalTx[]> => {
    const url = QLI_API_ENDPOINTS.ADDRESS_HISTORY(addressId, page)
    return makeApiRequest<HistoricalTx[]>(url)
  },
  getAddressAssets: async (addressId: string): Promise<Asset[]> => {
    const url = QLI_API_ENDPOINTS.ADDRESS_ASSETS
    return makeApiRequest<Asset[]>(url, 'POST', [addressId])
  }
}

export default qliApiService
