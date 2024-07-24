import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { BATCH_SIZE, TICK_SIZE } from '../../address/constants';
import mapHistoricalTxToArchiverTx from '../adapters/mapHistoricalTxToLatestTx';
import { fetchAddress, fetchHistoricalTxs, fetchTransferTxs } from './addressService';

export const getAddress = createAsyncThunk('network/address', async (addressId) => {
  try {
    const addressData = await fetchAddress(addressId);
    return addressData;
  } catch {
    throw new Error('Failed to fetch address data');
  }
});

export const getTransferTxs = createAsyncThunk(
  'network/getTransferTxs',
  async ({ addressId, startTick, endTick }) => {
    try {
      const transferTxsData = await fetchTransferTxs(
        addressId,
        startTick,
        endTick,
        BATCH_SIZE,
        TICK_SIZE
      );
      return transferTxsData;
    } catch {
      throw new Error('Failed to fetch transfer transactions');
    }
  }
);

export const getHistoricalTxs = createAsyncThunk(
  'network/getHistoricalTxs',
  async ({ addressId }, { getState }) => {
    const { page } = getState().network.address.historicalTxs;
    try {
      const historicalTxs = await fetchHistoricalTxs(addressId, page);
      return historicalTxs.map((tx) => mapHistoricalTxToArchiverTx(tx));
    } catch {
      throw new Error('Failed to fetch historical transactions');
    }
  }
);

const initialState = {
  address: null,
  isLoading: false,
  error: null,
  transferTxs: {
    data: [],
    isLoading: false,
    error: null,
    hasMore: true,
    lastStartTick: 0,
    lastEndTick: 0,
  },
  historicalTxs: {
    data: [],
    isLoading: false,
    error: null,
    hasMore: true,
    page: 0,
  },
};

const addressSlice = createSlice({
  name: 'network/address',
  initialState,
  reducers: {
    setLastEndTick: (state, action) => {
      state.transferTxs.lastEndTick = action.payload;
    },
    resetState: (state) => {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    builder
      // getAddress
      .addCase(getAddress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAddress.fulfilled, (state, action) => {
        state.isLoading = false;
        state.address = action.payload;
      })
      .addCase(getAddress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      // getTransferTxs
      .addCase(getTransferTxs.pending, (state) => {
        state.transferTxs.isLoading = true;
        state.transferTxs.error = null;
        state.transferTxs.load = true;
      })
      .addCase(getTransferTxs.fulfilled, (state, action) => {
        state.transferTxs.isLoading = false;
        const newTxs = action.payload;
        if (newTxs.data.length === 0) {
          state.transferTxs.hasMore = false;
        } else {
          state.transferTxs.data.push(...newTxs.data);
          state.transferTxs.lastStartTick = newTxs.lastStartTick;
          state.transferTxs.lastEndTick = newTxs.lastEndTick;
        }
      })
      .addCase(getTransferTxs.rejected, (state, action) => {
        state.transferTxs.isLoading = false;
        state.transferTxs.error = action.error.message;
      })
      // getHistoricalTxs
      .addCase(getHistoricalTxs.pending, (state) => {
        state.historicalTxs.isLoading = true;
        state.historicalTxs.error = null;
      })
      .addCase(getHistoricalTxs.fulfilled, (state, action) => {
        state.historicalTxs.isLoading = false;
        const newTxs = action.payload;
        if (
          newTxs.length === 0 ||
          newTxs.every((tx) =>
            state.historicalTxs.data.some((existingTx) => existingTx.id === tx.id)
          )
        ) {
          state.historicalTxs.hasMore = false;
        } else {
          state.historicalTxs.data.push(...newTxs);
          state.historicalTxs.page += 1;
        }
      })
      .addCase(getHistoricalTxs.rejected, (state, action) => {
        state.historicalTxs.isLoading = false;
        state.historicalTxs.error = action.error.message;
      });
  },
});

// Selectors to access the state
export const selectAddress = ({ network }) => network.address.address;
export const selectAddressLoading = ({ network }) => network.address.isLoading;
export const selectAddressError = ({ network }) => network.address.error;
// Txs selectors
export const selectTransferTxs = ({ network }) => network.address.transferTxs;
export const selectHistoricalTxs = ({ network }) => network.address.historicalTxs;

// actions
export const { setLastEndTick, resetState } = addressSlice.actions;

export default addressSlice.reducer;
