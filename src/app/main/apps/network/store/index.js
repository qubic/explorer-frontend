import { combineReducers } from '@reduxjs/toolkit';
import overview from './overviewSlice';
import block from './blockSlice';
import tx from './txSlice';
import address from './addressSlice';

const reducer = combineReducers({
  overview,
  block,
  tx,
  address,
});

export default reducer;
