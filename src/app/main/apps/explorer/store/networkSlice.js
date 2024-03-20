import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export const getNetwork = createAsyncThunk(
    'network/overview',
    async (params, { getState }) => {
        const response = await axios.get(`/Network/TickOverview?epoch=&offset=0`);

        const data = await response.data;

        console.log(data)

        return data;
    }
)

const networkSlice = createSlice({
    name: 'network/overview',
    initialState: null,
    reducers: {},
    extraReducers: {
        [getNetwork.fulfilled]: (state, action) => action.payload,
    },
})

export const selectNetwork = ({ network }) => network.network;

export default networkSlice.reducer;