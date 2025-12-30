import type { PayloadAction } from '@reduxjs/toolkit'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import type { AppDispatch, RootState } from '@app/store'
import type { GetTickDataResponse } from './apis/archiver-v1'
import { archiverV1Api } from './apis/archiver-v1'
import { archiverV2Api, type Transaction } from './apis/archiver-v2'
import type { GetAddressBalancesResponse } from './apis/rpc-live'
import { rpcLiveApi } from './apis/rpc-live'

type HandlerResponse = GetAddressBalancesResponse | GetTickDataResponse | Transaction

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

export enum SearchType {
  ADDRESS = 'address',
  TX = 'tx',
  TICK = 'tick'
}

interface SearchQuery {
  query: string
  type: SearchType | null
}

const makeSearchHandlers = (
  dispatch: AppDispatch
): Record<SearchType, (query: string) => Promise<HandlerResponse>> => ({
  [SearchType.TICK]: async (query) => {
    const tickData = await dispatch(
      archiverV1Api.endpoints.getTickData.initiate({ tick: parseInt(query, 10) })
    ).unwrap()
    return { tickData }
  },
  [SearchType.ADDRESS]: async (query) => {
    const balance = await dispatch(
      rpcLiveApi.endpoints.getAddressBalances.initiate({ address: query })
    ).unwrap()
    return { balance }
  },
  [SearchType.TX]: async (query) => {
    const transaction = await dispatch(
      archiverV2Api.endpoints.getTransaction.initiate(query)
    ).unwrap()
    return transaction
  }
})

export const getSearch = createAsyncThunk<
  SearchState['result'],
  SearchQuery,
  { dispatch: AppDispatch; rejectValue: string }
>('search', async ({ query, type }, { dispatch, rejectWithValue }) => {
  if (!type || !Object.values(SearchType).includes(type)) {
    return rejectWithValue('Invalid search type')
  }

  const searchHandlers = makeSearchHandlers(dispatch)

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
