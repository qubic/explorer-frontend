import axios from 'axios'
import { ARCHIVER_API_ENDPOINTS } from './endpoints'
import type {
  GetAddressTransferTransactionsResponse,
  GetBalanceResponse,
  GetEpochComputorsResponse,
  GetLatestStatsResponse,
  GetRichListResponse,
  GetStatusResponse,
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
  getStatus: async (): Promise<GetStatusResponse> => {
    const url = ARCHIVER_API_ENDPOINTS.STATUS
    return fetchData<GetStatusResponse>(url)
  },
  getLatestStats: async (): Promise<GetLatestStatsResponse> => {
    const url = ARCHIVER_API_ENDPOINTS.LATEST_STATS
    return fetchData<GetLatestStatsResponse>(url)
  },
  getAddressTransferTransactions: async (
    addressId: string,
    startTick: number,
    endTick: number
  ): Promise<GetAddressTransferTransactionsResponse> => {
    const url = ARCHIVER_API_ENDPOINTS.IDENTITY_TRANSFER_TRANSACTIONS(addressId, startTick, endTick)
    return fetchData<GetAddressTransferTransactionsResponse>(url)
  },
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
  },
  getRichList: async (page: number, pageSize: number): Promise<GetRichListResponse> => {
    const url = ARCHIVER_API_ENDPOINTS.RICH_LIST(page, pageSize)
    return fetchData<GetRichListResponse>(url)
  }
}

export default archiverApiService
