import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import type { Balance } from '@app/services/archiver'
import { archiverApiService } from '@app/services/archiver'
import type { Asset, ReportedValues } from '@app/services/qli'
import { qliApiService } from '@app/services/qli'
import type { RootState } from '@app/store'
import type { TransactionWithStatus } from '@app/types'
import { handleThunkError } from '@app/utils/error-handlers'
import { convertHistoricalTxToTxWithStatus } from './adapters'

export const getAddress = createAsyncThunk(
  'network/address',
  async (addressId: string, { rejectWithValue }) => {
    try {
      const [{ reportedValues }, { lastProcessedTick }, { balance }, addressAssets] =
        await Promise.all([
          qliApiService.getAddress(addressId),
          archiverApiService.getStatus(),
          archiverApiService.getBalance(addressId),
          qliApiService.getAddressAssets(addressId)
        ])

      return {
        addressId,
        reportedValues,
        endTick: lastProcessedTick.tickNumber,
        balance,
        assets: addressAssets
      }
    } catch (error) {
      return rejectWithValue(handleThunkError(error))
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
  addressId: string
  reportedValues: ReportedValues
  endTick: number
  balance: Balance
  assets: Asset[]
}

export interface AddressState {
  address: Address | null
  isLoading: boolean
  error: string | null
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
export const selectHistoricalTxs = (state: RootState) => state.network.address.historicalTxs

// actions
export const { resetState } = addressSlice.actions

export default addressSlice.reducer
