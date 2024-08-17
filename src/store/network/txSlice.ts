import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import type { Transaction, TransactionStatus } from '@app/services/archiver'
import { archiverApiService } from '@app/services/archiver'
import { qliApiService } from '@app/services/qli'
import type { RootState } from '@app/store'
import type { TxType } from '@app/types'
import { convertHistoricalTxToTxWithStatus } from './adapters'

export type TransactionWithStatus = {
  tx: Transaction
  status: TransactionStatus
}

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
  txType: TxType
}

export const getTx = createAsyncThunk<
  TransactionWithStatus,
  GetTxArgs,
  {
    state: RootState
  }
>('network/tx', async ({ txId, txType }, { getState }) => {
  if (!txId) {
    throw new Error('Invalid transaction ID')
  }

  if (txType === 'historical') {
    const historicalTx = getState().network.address.historicalTxs.data.find(
      ({ tx }) => tx.txId === txId
    )

    if (!historicalTx) {
      const getHistoricalTxResult = await qliApiService.getTransaction(txId)
      return convertHistoricalTxToTxWithStatus(getHistoricalTxResult)
    }

    return historicalTx
  }

  const [{ transaction }, { transactionStatus }] = await Promise.all([
    archiverApiService.getTransaction(txId),
    archiverApiService.getTransactionStatus(txId)
  ])

  return { tx: transaction, status: transactionStatus }
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
