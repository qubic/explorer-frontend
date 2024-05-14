import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

export const getAddress = createAsyncThunk('network/address', async (addressId, { getState }) => {
  try {
    const token = window.localStorage.getItem('jwt_access_token');
    const [qliAddressResponse, archStatusResponse] = await Promise.all([
      axios.get(`${process.env.REACT_APP_QLI_URL}/Network/Id/${addressId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      axios.get(`${process.env.REACT_APP_ARCHIEVER}/status`),
    ]);
    const reportedData = qliAddressResponse.data?.reportedValues;
    const endTick = archStatusResponse.data?.lastProcessedTick?.tickNumber;
    if (endTick) {
      console.log(endTick);
      const archAddressResponse = await axios.get(
        `${process.env.REACT_APP_ARCHIEVER}/identities/${addressId}/transfer-transactions?startTick=0&endTick=${endTick}`
      );
      const transferData = archAddressResponse.data.transferTransactionsPerTick;

      const data = {
        reportedValues: reportedData,
        transferTx: transferData,
      };

      console.log(data);
      return data;
    }
    throw new Error('Failed to fetch address data');
  } catch {
    throw new Error('Failed to fetch address data');
  }
});

const addressSlice = createSlice({
  name: 'network/address',
  initialState: {
    address: null,
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
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
      });
  },
});

// Selector to access the state
export const selectAddress = ({ network }) => network.address.address;
export const selectAddressLoading = ({ network }) => network.address.isLoading;
export const selectAddressError = ({ network }) => network.address.error;

export default addressSlice.reducer;
