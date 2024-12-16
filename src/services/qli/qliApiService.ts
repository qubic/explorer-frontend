import axios, { type Method } from 'axios'
import { QLI_API_ENDPOINTS } from './endpoints'
import type { HistoricalTx } from './types'

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
  getTransaction: async (txId: string): Promise<HistoricalTx> => {
    const url = QLI_API_ENDPOINTS.TX(txId)
    return makeApiRequest<HistoricalTx>(url)
  },
  getAddressHistory: async (addressId: string, page: number): Promise<HistoricalTx[]> => {
    const url = QLI_API_ENDPOINTS.ADDRESS_HISTORY(addressId, page)
    return makeApiRequest<HistoricalTx[]>(url)
  }
}

export default qliApiService
