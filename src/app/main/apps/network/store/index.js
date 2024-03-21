import { combineReducers } from "@reduxjs/toolkit";
import overview from './overviewSlice';
import block from './blockSlice';
import tx from './txSlice';

const reducer = combineReducers({
    overview,
    block,
    tx,
})

export default reducer;