import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

export const getRichList = createAsyncThunk('network/rich-list', async ({ page, pageSize }) => {
  const { data } = await axios.get(
    `${process.env.REACT_APP_ARCHIEVER}/rich-list?page=${page}&pageSize=${pageSize}`
  );

  return data;
});

const richListSlice = createSlice({
  name: 'network/rich-list',
  initialState: {
    epoch: null,
    entities: null,
    paginationInfo: null,
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getRichList.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getRichList.fulfilled, (state, action) => {
        state.isLoading = false;
        state.epoch = action.payload.epoch;
        state.entities = action.payload.richList.entities;
        state.paginationInfo = action.payload.pagination;
      })
      .addCase(getRichList.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  },
});

export const selectRichList = ({ network }) => network.richList;

export default richListSlice.reducer;
