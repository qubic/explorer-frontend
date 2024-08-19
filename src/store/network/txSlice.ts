import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import type { Transaction, TransactionStatus } from '@app/services/archiver'
import { archiverApiService } from '@app/services/archiver'
import { qliApiService } from '@app/services/qli'
import type { RootState } from '@app/store'
import { TxTypeEnum, type TxEra, type TxType } from '@app/types'
import { isTransferTx } from '@app/utils/qubic-ts'
import { convertHistoricalTxToTxWithStatus } from './adapters'

export type TransactionWithStatus = {
  tx: Transaction
  status: TransactionStatus & { txType: TxType }
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
  txEra: TxEra
}

export const getTx = createAsyncThunk<
  TransactionWithStatus,
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

  const { transaction } = await archiverApiService.getTransaction(txId)
  const { transactionStatus } = isTransferTx(
    transaction.sourceId,
    transaction.destId,
    transaction.amount
  )
    ? await archiverApiService.getTransactionStatus(txId)
    : { transactionStatus: { txId, moneyFlew: false, txType: TxTypeEnum.PROTOCOL } }

  return {
    tx: transaction,
    status: { ...transactionStatus, txType: TxTypeEnum.TRANSFER }
  }
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
