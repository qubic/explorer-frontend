import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import { qliApiService } from '@app/services/qli'
import type { RootState } from '@app/store'
import type { TransactionWithStatus } from '@app/types'
import { handleThunkError } from '@app/utils/error-handlers'
import { convertHistoricalTxToTxWithStatus } from './adapters'

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

export interface AddressState {
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
export const selectHistoricalTxs = (state: RootState) => state.network.address.historicalTxs

// actions
export const { resetState } = addressSlice.actions

export default addressSlice.reducer
