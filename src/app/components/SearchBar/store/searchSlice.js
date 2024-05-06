import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk
export const getSearch = createAsyncThunk('search', async (query, { getState }) => {
  const token = window.localStorage.getItem('jwt_access_token');
  const response = await axios.get(
    `${process.env.REACT_APP_QLI_URL}/Search/Query?searchTerm=${query}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const data = await response.data;
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
  reducers: {
    resetSearch: (state) => {
      state.result = null; // or [] depending on your initial state
      state.isLoading = false;
      state.error = null;
    },
  },
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
export const selectSearch = ({ search }) => search.search.result;
export const selectSearchLoading = ({ search }) => search.search.isLoading;
export const selectSearchError = ({ search }) => search.search.error;
export const { resetSearch } = searchSlice.actions;

export default searchSlice.reducer;
