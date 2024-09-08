import axios from 'axios'
import { QLI_API_ENDPOINTS } from './endpoints'
import type { Address, HistoricalTx, TickOverview } from './types'

const fetchData = async <T>(url: string): Promise<T> => {
  try {
    const token = window.localStorage.getItem('jwt_access_token')

    if (!token) {
      throw new Error('Error: Missing access token')
    }

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    return response.data as T
  } catch (error) {
    throw new Error(`Failed to fetch data from ${url}: ${(error as Error).message}`)
  }
}

const qliApiService = {
  getTickOverview: async (): Promise<TickOverview> => {
    const url = QLI_API_ENDPOINTS.TICK_OVERVIEW
    return fetchData<TickOverview>(url)
  },
  getTransaction: async (txId: string): Promise<HistoricalTx> => {
    const url = QLI_API_ENDPOINTS.TX(txId)
    return fetchData<HistoricalTx>(url)
  },
  getAddress: async (addressId: string): Promise<Address> => {
    const url = QLI_API_ENDPOINTS.ADDRESS(addressId)
    return fetchData<Address>(url)
  },
  getAddressHistory: async (addressId: string, page: number): Promise<HistoricalTx[]> => {
    const url = QLI_API_ENDPOINTS.ADDRESS_HISTORY(addressId, page)
    return fetchData<HistoricalTx[]>(url)
  }
}

export default qliApiService
