import { combineReducers } from "@reduxjs/toolkit";
import network from './networkSlice';
import block from './blockSlice';

const reducer = combineReducers({
    network,
    block,
})

export default reducer;