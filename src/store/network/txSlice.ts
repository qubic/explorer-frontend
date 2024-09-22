import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import { qliApiService } from '@app/services/qli'
import type { RootState } from '@app/store'
import type { TransactionWithStatus, TxEra } from '@app/types'
import { convertHistoricalTxToTxWithStatus } from './adapters'

export interface TxState {
  txWithStatus: TransactionWithStatus | null
  isLoading: boolean
  error: string | null
}

const initialState: TxState = {
  txWithStatus: null,
  isLoading: false,
  error: null
}

type GetTxArgs = {
  txId: string | undefined
  txEra: TxEra
}

export const getTx = createAsyncThunk<
  TransactionWithStatus | null,
  GetTxArgs,
  {
    state: RootState
  }
>('network/tx', async ({ txId, txEra }, { getState, rejectWithValue }) => {
  if (!txId) {
    return rejectWithValue('Invalid transaction ID')
  }

  if (txEra === 'historical') {
    const historicalTx = getState().network.address.historicalTxs.data.find(
      ({ tx }) => tx.txId === txId
    )

    if (!historicalTx) {
      const getHistoricalTxResult = await qliApiService.getTransaction(txId)
      return convertHistoricalTxToTxWithStatus(getHistoricalTxResult)
    }

    return historicalTx
  }

  return null
})

const txSlice = createSlice({
  name: 'network/tx',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getTx.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getTx.fulfilled, (state, action) => {
        state.isLoading = false
        state.txWithStatus = action.payload
      })
      .addCase(getTx.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Something went wrong'
      })
  }
})

// Selectors
export const selectTx = (state: RootState) => state.network.tx

export default txSlice.reducer
