import { combineReducers } from '@reduxjs/toolkit';
import address from './address/addressSlice';
import block from './blockSlice';
import overview from './overviewSlice';
import tx from './tx/txSlice';
import richList from './richListSlice';

const reducer = combineReducers({
  overview,
  block,
  tx,
  address,
  richList,
});

export default reducer;
