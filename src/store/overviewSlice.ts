import QLI_API_ENDPOINTS from '@app/services/qli/endpoints'
import type { TickOverview } from '@app/services/qli/types'
import type { RootState } from '@app/store'
import type { PayloadAction } from '@reduxjs/toolkit'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'

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
  const token = window.localStorage.getItem('jwt_access_token')
  const { data } = await axios.get(QLI_API_ENDPOINTS.TICK_OVERVIEW, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
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
export const selectOverview = (state: RootState) => state.overview

export default overviewSlice.reducer
