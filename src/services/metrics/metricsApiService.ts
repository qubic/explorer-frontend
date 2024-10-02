import axios from 'axios'
import { METRICS_API_ENDPOINTS } from './endpoints'
import type { QubicStats } from './types'

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

const metricsApiService = {
  getQubicStats: async (): Promise<QubicStats> => {
    const url = METRICS_API_ENDPOINTS.QUBIC_STATS
    return (await fetchData<{ data: QubicStats }>(url)).data
  }
}

export default metricsApiService
