import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

// Async thunk
export const getBlock = createAsyncThunk(
    'network/block',
    async (tick, { getState }) => {
        const response = await axios.get(`/Network/Block?tick=${tick}`);
        const data = await response.data;
        return data;
    }
);

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
