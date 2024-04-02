import { useEffect, useState } from 'react';
import { Input, IconButton, Popover } from '@mui/material';
import withReducer from 'app/store/withReducer';
import { useDispatch, useSelector } from 'react-redux';
import reducer from './store';
import { getSearch, selectSearch } from './store/searchSlice';

function SearchBar() {
  const dispatch = useDispatch();
  const searchResult = useSelector(selectSearch);
  const [menu, setMenu] = useState(null);
  const [keyword, setKeyword] = useState('');
  const searchMenuClick = (event) => {
    setMenu(event.currentTarget);
  };

  const searchMenuClose = () => {
    setMenu(null);
  };

  function handleMove() {
    searchMenuClose();
  }

  useEffect(() => {
    if (keyword && keyword.length > 1) {
      dispatch(getSearch(keyword));
    }
  }, [keyword]);

  return (
    <>
      <IconButton className="w-40 h-40" onClick={searchMenuClick}>
        <img className="w-full h-full" src="assets/icons/magnify.svg" alt="search" />
      </IconButton>
      <Popover
        open={Boolean(menu)}
        anchorReference="anchorPosition"
        anchorPosition={{
          top: 76,
        }}
        transformOrigin={{
          horizontal: 'left',
        }}
        sx={{
          '& .MuiPaper-root': {
            // Targeting the Paper component inside Popover
            width: '100%',
            left: 0,
            transformOrigin: 'top',
            maxWidth: '100%',
            maxHeight: '100%', // Full width
          },
        }}
        classes={{
          paper: 'bg-gray-80',
        }}
      >
        <div className="border-b-[1px] border-gray-70 flex justify-center items-center">
          <Input
            className="max-w-[820px] mx-auto w-full py-12"
            placeholder="Search TX, blocks, IDs..."
            value={keyword}
            disableUnderline
            startAdornment={
              <img className="w-16 h-16 mr-10" src="assets/icons/magnify.svg" alt="search" />
            }
            onChange={(e) => {
              setKeyword(e.target.value);
            }}
          />
          <IconButton className="absolute right-24" onClick={searchMenuClose}>
            <img className="w-24 h-24" src="assets/icons/xmark.svg" alt="xmark" />
          </IconButton>
        </div>
      </Popover>
    </>
  );
}

export default withReducer('search', reducer)(SearchBar);
