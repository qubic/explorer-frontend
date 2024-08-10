import { archiverApiService } from '@app/services/archiver'
import type {
  GetBalanceResponse,
  GetTickDataResponse,
  GetTransactionResponse
} from '@app/services/archiver/types'
import type { RootState } from '@app/store'
import type { PayloadAction } from '@reduxjs/toolkit'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

type HandlerResponse = GetBalanceResponse | GetTickDataResponse | GetTransactionResponse

export interface SearchState {
  result: HandlerResponse | null
  isLoading: boolean
  error: string | null
}

const initialState: SearchState = {
  result: null,
  isLoading: false,
  error: null
}

interface SearchQuery {
  query: string
  type: 'address' | 'tx' | 'tick' | null
}

const searchHandlers: Record<string, (query: string) => Promise<HandlerResponse>> = {
  address: archiverApiService.getBalance,
  tx: archiverApiService.getTransaction,
  tick: archiverApiService.getTickData
}

export const getSearch = createAsyncThunk<
  SearchState['result'],
  SearchQuery,
  { rejectValue: string }
>('search', async ({ query, type }, { rejectWithValue }) => {
  if (!type || type in searchHandlers === false) {
    return rejectWithValue('Invalid search type')
  }

  return searchHandlers[type](query)
})

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
        state.error = action.payload || action.error.message || 'Something went wrong'
      })
  }
})

// Selectors
export const selectSearch = (state: RootState) => state.search

export const { resetSearch } = searchSlice.actions

export default searchSlice.reducer
