import ARCHIVER_API_ENDPOINTS from '@app/services/archiver/endpoints'
import type {
  GetBalanceResponse,
  GetTickDataResponse,
  GetTransactionResponse
} from '@app/services/archiver/types'
import type { RootState } from '@app/store'
import type { PayloadAction } from '@reduxjs/toolkit'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'

export interface SearchState {
  result: GetBalanceResponse | GetTickDataResponse | GetTransactionResponse | null
  isLoading: boolean
  error: string | null
}

interface SearchQuery {
  query: string
  type: 'address' | 'tx' | 'tick' | null
}

export const getSearch = createAsyncThunk<SearchState['result'], SearchQuery>(
  'search',
  async ({ query, type }) => {
    const getRequestUrl = () => {
      switch (type) {
        case 'address':
          return ARCHIVER_API_ENDPOINTS.BALANCES(query)
        case 'tx':
          return ARCHIVER_API_ENDPOINTS.TRANSACTIONS(query)
        case 'tick':
          return ARCHIVER_API_ENDPOINTS.TICK_DATA(query)
        default:
          throw new Error('Invalid search type')
      }
    }

    const response = await axios.get(getRequestUrl())

    return response.data
  }
)

const initialState: SearchState = {
  result: null,
  isLoading: false,
  error: null
}

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    resetSearch: (state) => {
      state.result = null
      state.isLoading = false
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getSearch.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getSearch.fulfilled, (state, action: PayloadAction<SearchState['result']>) => {
        state.isLoading = false
        state.result = action.payload
      })
      .addCase(getSearch.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Something went wrong'
      })
  }
})

// Selectors
export const searchSelector = (state: RootState) => state.search

export const { resetSearch } = searchSlice.actions

export default searchSlice.reducer
