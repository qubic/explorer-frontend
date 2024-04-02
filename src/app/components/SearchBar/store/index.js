import { combineReducers } from '@reduxjs/toolkit';
import search from './searchSlice';

const reducer = combineReducers({
  search,
});

export default reducer;
