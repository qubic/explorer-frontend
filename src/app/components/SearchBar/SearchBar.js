import { useEffect, useState } from 'react';
import { Input, IconButton, LinearProgress, Modal } from '@mui/material';
import withReducer from 'app/store/withReducer';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import reducer from './store';
import { getSearch, resetSearch, selectSearch, selectSearchLoading } from './store/searchSlice';
import ResultItem from './ResultItem';

function SearchBar() {
  const dispatch = useDispatch();
  const searchResult = useSelector(selectSearch);
  const isLoading = useSelector(selectSearchLoading);
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [addressSearch, setAddressSearch] = useState('');
  const sortedByType = searchResult?.reduce((acc, item) => {
    if (!acc[item.type]) {
      acc[item.type] = [];
    }
    acc[item.type].push(item);
    return acc;
  }, {});

  useEffect(() => {
    const timerId = setTimeout(() => {
      if (keyword.trim().length === 60 && /^[A-Z\s]+$/.test(keyword.trim())) {
        setAddressSearch(keyword.trim());
        return;
      }

      if (keyword && keyword.length > 1) {
        dispatch(getSearch(keyword.trim()));
      }
    }, 1000);
    return () => clearTimeout(timerId);
  }, [keyword, dispatch]);

  const handleClose = () => {
    setOpen(false);
    dispatch(resetSearch());
    setKeyword('');
    setAddressSearch('');
  };

  return (
    <>
      <IconButton className="w-40 h-40" onClick={() => setOpen(true)}>
        <img className="w-full h-full" src="assets/icons/magnify.svg" alt="search" />
      </IconButton>
      <Modal
        open={open}
        onClose={handleClose}
        className="top-[76px] h-[calc(100%-76px)]"
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        sx={{
          '& .MuiBackdrop-root': {
            top: '76px',
            height: 'calc(100vh - 76px)',
            opacity: '0.8 !important',
            backgroundColor: '#101820',
          },
        }}
      >
        <div className="bg-gray-80">
          {isLoading && (
            <div className="absolute w-full">
              <LinearProgress />
            </div>
          )}
          <motion.div
            className="border-b-[1px] relative mx-auto max-w-[1440px] border-gray-70 flex justify-center items-center"
            variants={{
              hidden: {
                y: -20,
              },
              show: {
                y: 0,
              },
            }}
            initial="hidden"
            animate="show"
          >
            <Input
              className="max-w-[820px] mx-auto w-full py-12 px-20"
              placeholder="Search TX, ticks, IDs..."
              value={keyword}
              disableUnderline
              autoFocus
              startAdornment={
                <img className="w-16 h-16 mr-10" src="assets/icons/magnify.svg" alt="search" />
              }
              onChange={(e) => {
                setKeyword(e.target.value);
              }}
            />
            <IconButton className="absolute right-12 sm:right-24" onClick={handleClose}>
              <img className="w-24 h-24" src="assets/icons/xmark.svg" alt="xmark" />
            </IconButton>
          </motion.div>
          {addressSearch && (
            <div className="max-h-[320px] overflow-auto max-w-[800px] mx-auto">
              <ResultItem
                icon={
                  <img className="w-16 h-16 mr-6" src="assets/icons/grid-add.svg" alt="address" />
                }
                title="Qubic Address"
                link="/network/address/"
                address={addressSearch}
                handleClose={handleClose}
              />
            </div>
          )}
          {sortedByType && (
            <div className="max-h-[320px] overflow-auto max-w-[800px] mx-auto">
              {sortedByType?.[2]?.length > 0 && (
                <ResultItem
                  icon={
                    <img
                      className="w-16 h-16 mr-6"
                      src="assets/icons/grid-view.svg"
                      alt="address"
                    />
                  }
                  title="Tick/Block"
                  link="/network/tick/"
                  items={sortedByType[2]}
                  handleClose={handleClose}
                />
              )}
              {sortedByType?.[1]?.length > 0 && (
                <ResultItem
                  icon={
                    <img className="w-16 h-16 mr-6" src="assets/icons/camera.svg" alt="address" />
                  }
                  title="Transaction"
                  link="/network/tx/"
                  items={sortedByType[1]}
                  handleClose={handleClose}
                />
              )}
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}

export default withReducer('search', reducer)(SearchBar);
