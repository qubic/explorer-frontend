import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export const getAddress = createAsyncThunk(
    'network/address',
    async (addressId, { getState }) => {
        const response = await axios.get(`/Network/Id/${addressId}`);

        const data = await response.data;

        return data;
    }
)

const addressSlice = createSlice({
    name: 'network/address',
    initialState: null,
    reducers: {},
    extraReducers: {
        [getAddress.fulfilled]: (state, action) => action.payload,
    },
})

export const selectAddress = ({ network }) => network.address;

export default addressSlice.reducer;