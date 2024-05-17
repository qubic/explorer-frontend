import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk
export const getSearch = createAsyncThunk('search', async ({ query, type }, { getState }) => {
  const getRequestUrl = () => {
    switch (type) {
      case 'address':
        return `${process.env.REACT_APP_ARCHIEVER}/balances/${query}`;
      case 'tx':
        return `${process.env.REACT_APP_ARCHIEVER}/transactions/${query}`;
      case 'tick':
        return `${process.env.REACT_APP_ARCHIEVER}/ticks/${parseInt(
          query.replace(/,/g, ''),
          10
        )}/tick-data`;
      default:
        throw new Error('Invalid search type');
    }
  };

  const response = await axios.get(getRequestUrl());
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
