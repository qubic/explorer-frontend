import axios from 'axios'
import { ARCHIVER_API_ENDPOINTS } from './endpoints'
import type {
  GetBalanceResponse,
  GetEpochComputorsResponse,
  GetTickApprovedTransactionsResponse,
  GetTickDataResponse,
  GetTickTransactionsResponse,
  GetTickTransferTransactionsResponse,
  GetTransactionResponse,
  GetTransactionStatusResponse
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
  getBalance: async (query: string): Promise<GetBalanceResponse> => {
    const url = ARCHIVER_API_ENDPOINTS.BALANCES(query)
    return fetchData<GetBalanceResponse>(url)
  },
  getTransaction: async (txId: string): Promise<GetTransactionResponse> => {
    const url = ARCHIVER_API_ENDPOINTS.TRANSACTIONS(txId)
    return fetchData<GetTransactionResponse>(url)
  },
  getTransactionStatus: async (txId: string): Promise<GetTransactionStatusResponse> => {
    const url = ARCHIVER_API_ENDPOINTS.TRANSACTION_STATUS(txId)
    return fetchData<GetTransactionStatusResponse>(url)
  },
  getTickData: async (tick: string): Promise<GetTickDataResponse> => {
    const url = ARCHIVER_API_ENDPOINTS.TICK_DATA(tick)
    return fetchData<GetTickDataResponse>(url)
  },
  getTickTransactions: async (tick: string): Promise<GetTickTransactionsResponse> => {
    const url = ARCHIVER_API_ENDPOINTS.TICK_TRANSACTIONS(tick)
    return fetchData<GetTickTransactionsResponse>(url)
  },
  getTickTransferTransactions: async (
    tick: string
  ): Promise<GetTickTransferTransactionsResponse> => {
    const url = ARCHIVER_API_ENDPOINTS.TICK_TRANSFER_TRANSACTIONS(tick)
    return fetchData<GetTickTransferTransactionsResponse>(url)
  },
  getTickApprovedTransactions: async (
    tick: string
  ): Promise<GetTickApprovedTransactionsResponse> => {
    const url = ARCHIVER_API_ENDPOINTS.TICK_APPROVED_TRANSACTIONS(tick)
    return fetchData<GetTickApprovedTransactionsResponse>(url)
  },
  getEpochComputors: async (epoch: number): Promise<GetEpochComputorsResponse> => {
    const url = ARCHIVER_API_ENDPOINTS.EPOCH_COMPUTORS(epoch)
    return fetchData<GetEpochComputorsResponse>(url)
  }
}

export default archiverApiService
