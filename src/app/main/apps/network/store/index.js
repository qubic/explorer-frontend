import { combineReducers } from '@reduxjs/toolkit';
import address from './address/addressSlice';
import block from './blockSlice';
import overview from './overviewSlice';
import tx from './txSlice';

const reducer = combineReducers({
  overview,
  block,
  tx,
  address,
});

export default reducer;
