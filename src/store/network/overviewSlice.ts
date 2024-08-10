import { qliApiService } from '@app/services/qli'
import type { TickOverview } from '@app/services/qli/types'
import type { RootState } from '@app/store'
import type { PayloadAction } from '@reduxjs/toolkit'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

export interface OverviewState {
  overview: TickOverview | null
  isLoading: boolean
  error: string | null
}

const initialState: OverviewState = {
  overview: null,
  isLoading: false,
  error: null
}

export const getOverview = createAsyncThunk('network/overview', async () => {
  const tickOverview = await qliApiService.getTickOverview()
  return tickOverview
})

const overviewSlice = createSlice({
  name: 'network/overview',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getOverview.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getOverview.fulfilled, (state, action: PayloadAction<TickOverview>) => {
        state.isLoading = false
        state.overview = action.payload
      })
      .addCase(getOverview.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Failed to fetch overview'
      })
  }
})

// Selectors
export const selectOverview = (state: RootState) => state.network.overview

export default overviewSlice.reducer
