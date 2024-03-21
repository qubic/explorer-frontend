import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export const getTx = createAsyncThunk(
    'network/tx',
    async (txId, { getState }) => {
        const response = await axios.get(`/Network/tx/${txId}`);

        const data = await response.data;

        return data;
    }
)

const txSlice = createSlice({
    name: 'network/tx',
    initialState: null,
    reducers: {},
    extraReducers: {
        [getTx.fulfilled]: (state, action) => action.payload,
    },
})

export const selectTx = ({ network }) => network.tx;

export default txSlice.reducer;