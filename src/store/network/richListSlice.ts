import type { Entity, GetRichListResponse, PaginationInfo } from '@app/services/archiver'
import { archiverApiService } from '@app/services/archiver'
import type { RootState } from '@app/store'
import { handleThunkError } from '@app/utils/error-handlers'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

export interface RichListState {
  epoch: number | null
  entities: Entity[] | null
  paginationInfo: PaginationInfo
  isLoading: boolean
  error: string | null
}

const initialState: RichListState = {
  epoch: null,
  entities: null,
  paginationInfo: { totalRecords: 0, currentPage: 0, totalPages: 0 },
  isLoading: false,
  error: null
}

export const getRichList = createAsyncThunk<
  GetRichListResponse,
  { page: number; pageSize: number },
  {
    state: RootState
  }
>(
  'network/rich-list',
  async ({ page, pageSize }, { rejectWithValue }) => {
    try {
      const result = await archiverApiService.getRichList(page, pageSize)

      return result
    } catch (error) {
      return rejectWithValue(handleThunkError(error))
    }
  },
  {
    condition: (_, { getState }) => {
      const { isLoading, error } = getState().network.richList
      return !isLoading && !error
    }
  }
)

const richListSlice = createSlice({
  name: 'network/rich-list',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getRichList.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getRichList.fulfilled, (state, action) => {
        state.isLoading = false
        state.epoch = action.payload.epoch
        state.entities = action.payload.richList.entities
        state.paginationInfo = action.payload.pagination
      })
      .addCase(getRichList.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Something went wrong'
      })
  }
})

export const selectRichList = (state: RootState) => state.network.richList

export default richListSlice.reducer
