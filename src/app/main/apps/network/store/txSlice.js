import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

export const getTx = createAsyncThunk('network/tx', async (txId, { getState }) => {
  const response = await axios.get(`/Network/tx/${txId}`);

  const data = await response.data;

  return data;
});

const txSlice = createSlice({
  name: 'network/tx',
  initialState: {
    tx: null,
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getTx.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTx.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tx = action.payload;
      })
      .addCase(getTx.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  },
});

// Selector to access the state
export const selectTx = ({ network }) => network.tx.tx;
export const selectTxLoading = ({ network }) => network.tx.isLoading;
export const selectTxError = ({ network }) => network.tx.error;

export default txSlice.reducer;
