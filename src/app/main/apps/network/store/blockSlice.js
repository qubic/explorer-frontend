import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk
export const getBlock = createAsyncThunk('network/block', async (tick, { getState }) => {
  try {
    const tickDataResponse = await axios.get(
      `${process.env.REACT_APP_ARCHIEVER}/ticks/${tick}/tick-data`
    );
    const tickData = await tickDataResponse.data.tickData;

    if (tickData?.epoch) {
      const [txResponse, transferResponse, approvedResponse, epochResponse] =
        await fetchTransactionData(tick, tickData);
      const txData = await txResponse.data.transactions;
      const transferData = await transferResponse.data.transactions;
      const approvedData = await approvedResponse.data.approvedTransactions;
      const epochData = await epochResponse.data.computors;
      const data = {
        tick: tickData,
        tx: txData,
        transferTx: transferData,
        approvedTx: approvedData,
        epoch: epochData,
      };

      return data;
    }

    throw new Error('Failed to fetch transaction data');
  } catch (error) {
    // Handle errors
    throw new Error('Failed to fetch transaction data');
  }
});

const fetchTransactionData = async (tick, tickData) => {
  try {
    return await Promise.all([
      axios.get(`${process.env.REACT_APP_ARCHIEVER}/ticks/${tick}/transactions`),
      axios.get(`${process.env.REACT_APP_ARCHIEVER}/ticks/${tick}/transfer-transactions`),
      axios.get(`${process.env.REACT_APP_ARCHIEVER}/ticks/${tick}/approved-transactions`),
      axios.get(`${process.env.REACT_APP_ARCHIEVER}/epochs/${tickData?.epoch}/computors`),
    ]);
  } catch (error) {
    console.log('fetchTransactionError: ', error);
    throw new Error('Failed to fetch transaction data');
  }
};

// Slice with loading and error state
const blockSlice = createSlice({
  name: 'network/block',
  initialState: {
    block: null,
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getBlock.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getBlock.fulfilled, (state, action) => {
        state.isLoading = false;
        state.block = action.payload;
      })
      .addCase(getBlock.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  },
});

// Selector to access the state
export const selectBlock = ({ network }) => network.block.block;
export const selectBlockLoading = ({ network }) => network.block.isLoading;
export const selectBlockError = ({ network }) => network.block.error;

export default blockSlice.reducer;
