import { archiverApiService } from '@app/services/archiver'
import type { Computor, TickData, Transaction } from '@app/services/archiver/types'
import type { RootState } from '@app/store'
import type { PayloadAction } from '@reduxjs/toolkit'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

type Block = {
  tick: TickData
  tx: Transaction[]
  transferTx: Transaction[]
  approvedTx: Transaction[]
  epoch: Computor
}

export interface BlockState {
  block: Block | null
  isLoading: boolean
  error: string | null
}

const initialState: BlockState = {
  block: null,
  isLoading: false,
  error: null
}

export const getBlock = createAsyncThunk('network/block', async (tick: string) => {
  try {
    const { tickData } = await archiverApiService.getTickData(tick)

    if (!tickData.epoch) {
      throw new Error('Failed to fetch tick data')
    }

    const [txResponse, transferResponse, approvedResponse, epochResponse] = await Promise.all([
      archiverApiService.getTickTransactions(tick),
      archiverApiService.getTickTransferTransactions(tick),
      archiverApiService.getTickApprovedTransactions(tick),
      archiverApiService.getEpochComputors(tickData.epoch)
    ])

    return {
      tick: tickData,
      tx: txResponse.transactions,
      transferTx: transferResponse.transactions,
      approvedTx: approvedResponse.approvedTransactions,
      epoch: epochResponse.computors
    }
  } catch (error) {
    throw new Error('Failed to fetch block data')
  }
})

const blockSlice = createSlice({
  name: 'network/block',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getBlock.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getBlock.fulfilled, (state, action: PayloadAction<Block>) => {
        state.isLoading = false
        state.block = action.payload
      })
      .addCase(getBlock.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message ?? 'Unknown error'
      })
  }
})

// Selectors
export const selectBlock = (state: RootState) => state.network.block

export default blockSlice.reducer
