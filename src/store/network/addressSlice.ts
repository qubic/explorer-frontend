import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import { BATCH_SIZE, TICK_SIZE } from '@app/pages/network/address/components/Transactions'
import type { Balance, Transaction } from '@app/services/archiver'
import { archiverApiService } from '@app/services/archiver'
import type { ReportedValues } from '@app/services/qli'
import { qliApiService } from '@app/services/qli'
import type { RootState } from '@app/store'
import { handleThunkError } from '@app/utils/error-handlers'
import { convertHistoricalTxToTxWithStatus } from './adapters'
import type { TransactionWithStatus } from './txSlice'

export type TransactionWithMoneyFlew = Transaction & { moneyFlew: boolean | null }

export const getAddress = createAsyncThunk(
  'network/address',
  async (addressId: string, { rejectWithValue }) => {
    try {
      const [{ reportedValues }, { lastProcessedTick }, { balance }] = await Promise.all([
        qliApiService.getAddress(addressId),
        archiverApiService.getStatus(),
        archiverApiService.getBalance(addressId)
      ])
      return {
        reportedValues,
        endTick: lastProcessedTick.tickNumber,
        balance
      }
    } catch (error) {
      return rejectWithValue(handleThunkError(error))
    }
  }
)

export const getTransferTxs = createAsyncThunk<
  {
    data: TransactionWithMoneyFlew[]
    lastStartTick: number
    lastEndTick: number
  },
  { addressId: string; startTick: number; endTick: number },
  {
    state: RootState
  }
>(
  'network/getTransferTxs',
  async ({ addressId, startTick, endTick }, { rejectWithValue }) => {
    try {
      let data: Transaction[] = []
      let lastStartTick = startTick
      let lastEndTick = endTick

      const getTransfers = async (start: number, end: number) => {
        const { transferTransactionsPerTick } =
          await archiverApiService.getAddressTransferTransactions(addressId, start, end)
        return transferTransactionsPerTick.flatMap(({ transactions }) => transactions) || []
      }
      const fetchRecursive = async (start: number, end: number) => {
        const transfers = await getTransfers(start, end)
        data = [...new Set(data.concat(transfers))]

        if (start === 0 && transfers.length === 0) {
          return { data: data.sort((a, b) => b.tickNumber - a.tickNumber) }
        }

        if (data.length < BATCH_SIZE) {
          lastEndTick = Math.max(0, start - 1)
          lastStartTick = Math.max(0, lastEndTick - TICK_SIZE)

          return fetchRecursive(lastStartTick, lastEndTick)
        }
        return { data: data.sort((a, b) => b.tickNumber - a.tickNumber) }
      }

      const finalResult = await fetchRecursive(startTick, endTick)

      const txsWithMoneyFlew = await Promise.all(
        finalResult.data.map(async (tx) => {
          try {
            const { transactionStatus } = await archiverApiService.getTransactionStatus(tx.txId)
            return { ...tx, moneyFlew: transactionStatus.moneyFlew }
          } catch (error) {
            return { ...tx, moneyFlew: null }
          }
        })
      )

      return { data: txsWithMoneyFlew, lastStartTick, lastEndTick }
    } catch (error) {
      return rejectWithValue(handleThunkError(error))
    }
  },
  // Conditionally fetch historical transactions to prevent issues from React.StrictMode - https://redux.js.org/tutorials/essentials/part-5-async-logic#avoiding-duplicate-fetches
  {
    condition: (_, { getState }) => {
      const { isLoading, hasMore, error } = getState().network.address.transferTxs
      return !isLoading && hasMore && !error
    }
  }
)

export const getHistoricalTxs = createAsyncThunk<
  TransactionWithStatus[],
  string,
  {
    state: RootState
  }
>(
  'network/getHistoricalTxs',
  async (addressId, { getState, rejectWithValue }) => {
    try {
      const { page } = getState().network.address.historicalTxs
      const historicalTxs = await qliApiService.getAddressHistory(addressId, page)
      return historicalTxs.map(convertHistoricalTxToTxWithStatus)
    } catch (error) {
      return rejectWithValue(handleThunkError(error))
    }
  },
  // Conditionally fetch historical transactions to prevent issues from React.StrictMode - https://redux.js.org/tutorials/essentials/part-5-async-logic#avoiding-duplicate-fetches
  {
    condition: (_, { getState }) => {
      const { isLoading, hasMore, error } = getState().network.address.historicalTxs
      return !isLoading && hasMore && !error
    }
  }
)

export type Address = {
  reportedValues: ReportedValues
  endTick: number
  balance: Balance
}

export interface AddressState {
  address: Address | null
  isLoading: boolean
  error: string | null
  transferTxs: {
    data: TransactionWithMoneyFlew[]
    isLoading: boolean
    error: string | null
    hasMore: boolean
    lastStartTick: number
    lastEndTick: number
  }
  historicalTxs: {
    data: TransactionWithStatus[]
    isLoading: boolean
    error: string | null
    hasMore: boolean
    page: number
  }
}

const initialState: AddressState = {
  address: null,
  isLoading: false,
  error: null,
  transferTxs: {
    data: [],
    isLoading: false,
    error: null,
    hasMore: true,
    lastStartTick: 0,
    lastEndTick: 0
  },
  historicalTxs: {
    data: [],
    isLoading: false,
    error: null,
    hasMore: true,
    page: 0
  }
}

const addressSlice = createSlice({
  name: 'network/address',
  initialState,
  reducers: {
    resetState: (state) => {
      Object.assign(state, initialState)
    }
  },
  extraReducers: (builder) => {
    builder
      // getAddress
      .addCase(getAddress.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getAddress.fulfilled, (state, action) => {
        state.isLoading = false
        state.address = action.payload
      })
      .addCase(getAddress.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message ?? 'Unknown error'
      })
      // getTransferTxs
      .addCase(getTransferTxs.pending, (state) => {
        state.transferTxs.isLoading = true
        state.transferTxs.error = null
      })
      .addCase(getTransferTxs.fulfilled, (state, action) => {
        state.transferTxs.isLoading = false
        const newTxs = action.payload
        if (newTxs.data.length === 0) {
          state.transferTxs.hasMore = false
        } else {
          state.transferTxs.data.push(...newTxs.data)
        }
        state.transferTxs.lastStartTick = newTxs.lastStartTick
        state.transferTxs.lastEndTick = newTxs.lastEndTick
      })
      .addCase(getTransferTxs.rejected, (state, action) => {
        state.transferTxs.isLoading = false
        state.transferTxs.error = action.error.message ?? 'Unknown error'
      })
      // getHistoricalTxs
      .addCase(getHistoricalTxs.pending, (state) => {
        state.historicalTxs.isLoading = true
        state.historicalTxs.error = null
      })
      .addCase(getHistoricalTxs.fulfilled, (state, action) => {
        state.historicalTxs.isLoading = false
        const newTxs = action.payload
        if (newTxs.length === 0) {
          state.historicalTxs.hasMore = false
        } else {
          state.historicalTxs.hasMore = true
          state.historicalTxs.data.push(...newTxs)
          state.historicalTxs.page += 1
        }
      })
      .addCase(getHistoricalTxs.rejected, (state, action) => {
        state.historicalTxs.isLoading = false
        state.historicalTxs.error = action.error.message ?? 'Unknown error'
      })
  }
})

// Selectors
export const selectAddress = (state: RootState) => state.network.address
export const selectTransferTxs = (state: RootState) => state.network.address.transferTxs
export const selectHistoricalTxs = (state: RootState) => state.network.address.historicalTxs

// actions
export const { resetState } = addressSlice.actions

export default addressSlice.reducer
