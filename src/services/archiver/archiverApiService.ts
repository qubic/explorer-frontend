import axios from 'axios'
import ARCHIVER_API_ENDPOINTS from './endpoints'
import type {
  GetBalancesResponse,
  GetEpochComputorsResponse,
  GetTickApprovedTransactionsResponse,
  GetTickDataResponse,
  GetTickTransactionsResponse,
  GetTickTransferTransactionsResponse,
  GetTransactionByIdResponse
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
  getBalances: async (query: string): Promise<GetBalancesResponse> => {
    const url = ARCHIVER_API_ENDPOINTS.BALANCES(query)
    return fetchData<GetBalancesResponse>(url)
  },
  getTransactions: async (query: string): Promise<GetTransactionByIdResponse> => {
    const url = ARCHIVER_API_ENDPOINTS.TRANSACTIONS(query)
    return fetchData<GetTransactionByIdResponse>(url)
  },
  getTickData: async (query: string): Promise<GetTickDataResponse> => {
    const url = ARCHIVER_API_ENDPOINTS.TICK_DATA(query)
    return fetchData<GetTickDataResponse>(url)
  },
  getTickTransactions: async (query: string): Promise<GetTickTransactionsResponse> => {
    const url = ARCHIVER_API_ENDPOINTS.TICK_TRANSACTIONS(query)
    return fetchData<GetTickTransactionsResponse>(url)
  },
  getTickTransferTransactions: async (
    query: string
  ): Promise<GetTickTransferTransactionsResponse> => {
    const url = ARCHIVER_API_ENDPOINTS.TICK_TRANSFER_TRANSACTIONS(query)
    return fetchData<GetTickTransferTransactionsResponse>(url)
  },
  getTickApprovedTransactions: async (
    query: string
  ): Promise<GetTickApprovedTransactionsResponse> => {
    const url = ARCHIVER_API_ENDPOINTS.TICK_APPROVED_TRANSACTIONS(query)
    return fetchData<GetTickApprovedTransactionsResponse>(url)
  },
  getEpochComputors: async (query: number): Promise<GetEpochComputorsResponse> => {
    const url = ARCHIVER_API_ENDPOINTS.EPOCH_COMPUTORS(query)
    return fetchData<GetEpochComputorsResponse>(url)
  }
}

export default archiverApiService
