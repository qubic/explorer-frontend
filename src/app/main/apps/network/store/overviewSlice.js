import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

export const getOverview = createAsyncThunk('network/overview', async (params, { getState }) => {
  const token = window.localStorage.getItem('jwt_access_token');
  const response = await axios.get(`${process.env.REACT_APP_QLI_URL}/Network/TickOverview`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.data;
  return data;
});

const networkSlice = createSlice({
  name: 'network/overview',
  initialState: {
    overview: null,
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getOverview.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getOverview.fulfilled, (state, action) => {
        state.isLoading = false;
        state.overview = action.payload;
      })
      .addCase(getOverview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  },
});

export const selectOverview = ({ network }) => network.overview.overview;
export const selectOverviewLoading = ({ network }) => network.overview.isLoading;
export const selectOverviewError = ({ network }) => network.overview.error;

export default networkSlice.reducer;
