import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export const getBlock = createAsyncThunk(
    'network/block',
    async (tick, { getState }) => {
        const response = await axios.get(`/Network/Block?tick=${tick}`);

        const data = await response.data;

        console.log(data)

        return data;
    }
)

const networkSlice = createSlice({
    name: 'network/block',
    initialState: null,
    reducers: {},
    extraReducers: {
        [getBlock.fulfilled]: (state, action) => action.payload,
    },
})

export const selectBlock = ({ network }) => network.block;

export default networkSlice.reducer;