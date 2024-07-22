import QLI_API_ENDPOINTS from '@app/api/qli/endpoints'
import type { TickOverview } from '@app/api/qli/types'
import type { RootState } from '@app/store'
import type { PayloadAction } from '@reduxjs/toolkit'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'

export interface NetworkState {
  overview: TickOverview | null
  isLoading: boolean
  error: string | null
}

const initialState: NetworkState = {
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

const networkSlice = createSlice({
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

export const selectNetworkOverview = (state: RootState) => state.network
export const selectOverview = (state: RootState) => state.network.overview
export const selectOverviewLoading = (state: RootState) => state.network.isLoading
export const selectOverviewError = (state: RootState) => state.network.error

export default networkSlice.reducer
