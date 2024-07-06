import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import mapHistoricalTxToArchiverTx from '../adapters/mapHistoricalTxToLatestTx';
import { fetchHistoricalTx, fetchTransferTxWithStatus } from './txService';

/**
 * Fetch transaction information and status from the server.
 * @param {string} txId - The ID of the transaction to fetch.
 * @returns {Promise<Object>} A promise that resolves with the transaction information and status.
 */

export const getTx = createAsyncThunk('network/tx', async ({ txId, txType }, { getState }) => {
  try {
    if (txType === 'historical') {
      const historicalTx = getState().network.address.historicalTxs.data.find(
        (tx) => tx.id === txId
      );

      if (!historicalTx) {
        const data = await fetchHistoricalTx(txId);
        return {
          tx: mapHistoricalTxToArchiverTx(data),
          status: { txId: data.id, moneyFlew: data.moneyFlew },
        };
      }

      return {
        tx: mapHistoricalTxToArchiverTx(historicalTx),
        status: { txId: historicalTx.id, moneyFlew: historicalTx.moneyFlew },
      };
    }

    return await fetchTransferTxWithStatus(txId);
  } catch (error) {
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
