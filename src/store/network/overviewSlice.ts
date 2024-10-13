import { archiverApiService } from '@app/services/archiver'
import { qliApiService } from '@app/services/qli'
import type { TickOverview } from '@app/services/qli/types'
import type { RootState } from '@app/store'
import type { PayloadAction } from '@reduxjs/toolkit'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

type TickOverviewWithBurnedQus = TickOverview & { burnedQus: string; epochTickQuality: number }

export interface OverviewState {
  overview: TickOverviewWithBurnedQus | null
  isLoading: boolean
  error: string | null
}

const initialState: OverviewState = {
  overview: null,
  isLoading: false,
  error: null
}

export const getOverview = createAsyncThunk<TickOverviewWithBurnedQus>(
  'network/overview',
  async () => {
    const [tickOverview, latestStats] = await Promise.all([
      qliApiService.getTickOverview(),
      archiverApiService.getLatestStats()
    ])
    return {
      ...tickOverview,
      burnedQus: latestStats.data.burnedQus,
      epochTickQuality: latestStats.data.epochTickQuality
    }
  }
)

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
      .addCase(getOverview.fulfilled, (state, action: PayloadAction<TickOverviewWithBurnedQus>) => {
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
