import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk
export const getSearch = createAsyncThunk('search', async (query, { getState }) => {
  const response = await axios.get(`/Search/Query?searchTerm=${query}`);
  const data = await response.data;
  console.log(data);
  return data;
});

// Slice with loading and error state
const searchSlice = createSlice({
  name: 'search',
  initialState: {
    result: null,
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getSearch.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getSearch.fulfilled, (state, action) => {
        state.isLoading = false;
        state.result = action.payload;
      })
      .addCase(getSearch.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  },
});

// Selector to access the state
export const selectSearch = ({ search }) => search.result;
export const selectSearchLoading = ({ search }) => search.isLoading;
export const selectSearchError = ({ search }) => search.error;

export default searchSlice.reducer;
