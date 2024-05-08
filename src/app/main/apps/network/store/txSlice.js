import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

/**
 * Fetch transaction information and status from the server.
 * @param {string} txId - The ID of the transaction to fetch.
 * @returns {Promise<Object>} A promise that resolves with the transaction information and status.
 */

export const getTx = createAsyncThunk('network/tx', async (txId, { getState }) => {
  try {
    // First request
    const infoResponse = await axios.get(`${process.env.REACT_APP_ARCHIEVER}/transactions/${txId}`);
    const txInfo = infoResponse.data.transaction;

    // Second request
    const statusResponse = await axios.get(`${process.env.REACT_APP_ARCHIEVER}/tx-status/${txId}`);
    const txStatus = statusResponse.data.transactionStatus;

    // Combine data from both requests if needed
    const data = { tx: txInfo, status: txStatus };

    return data;
  } catch (error) {
    // Handle errors
    throw new Error('Failed to fetch transaction data');
  }
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
