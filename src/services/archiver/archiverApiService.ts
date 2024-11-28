import axios from 'axios'
import { ARCHIVER_API_ENDPOINTS } from './endpoints'
import type {
  GetBalanceResponse,
  GetLatestStatsResponse,
  GetStatusResponse,
  GetTickDataResponse,
  GetTransactionResponse
} from './types'

const fetchData = async <T>(url: string): Promise<T> => {
  try {
    const response = await axios.get(url)
    return response.data as T
  } catch (error) {
    throw new Error(`Failed to fetch data from ${url}: ${(error as Error).message}`)
  }
}

const archiverApiService = {
  getStatus: async (): Promise<GetStatusResponse> => {
    const url = ARCHIVER_API_ENDPOINTS.STATUS
    return fetchData<GetStatusResponse>(url)
  },
  getLatestStats: async (): Promise<GetLatestStatsResponse> => {
    const url = ARCHIVER_API_ENDPOINTS.LATEST_STATS
    return fetchData<GetLatestStatsResponse>(url)
  },
  getBalance: async (query: string): Promise<GetBalanceResponse> => {
    const url = ARCHIVER_API_ENDPOINTS.BALANCES(query)
    return fetchData<GetBalanceResponse>(url)
  },
  getTransaction: async (txId: string): Promise<GetTransactionResponse> => {
    const url = ARCHIVER_API_ENDPOINTS.TRANSACTIONS(txId)
    return fetchData<GetTransactionResponse>(url)
  },
  getTickData: async (tick: string): Promise<GetTickDataResponse> => {
    const url = ARCHIVER_API_ENDPOINTS.TICK_DATA(tick)
    return fetchData<GetTickDataResponse>(url)
  }
}

export default archiverApiService
