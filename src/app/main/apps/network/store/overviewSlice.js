import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export const getOverview = createAsyncThunk(
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
        [getOverview.fulfilled]: (state, action) => action.payload,
    },
})

export const selectOverview = ({ network }) => network.overview;

export default networkSlice.reducer;