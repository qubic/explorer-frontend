import { useEffect, useState } from 'react';
import { Input, IconButton, LinearProgress, Modal, useTheme, Typography } from '@mui/material';
import withReducer from 'app/store/withReducer';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { formatBase64, formatDate, formatString } from 'src/app/utils/functions';
import reducer from './store';
import {
  getSearch,
  resetSearch,
  selectSearch,
  selectSearchError,
  selectSearchLoading,
} from './store/searchSlice';
import ResultItem from './ResultItem';

function SearchBar() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const searchResult = useSelector(selectSearch);
  const isLoading = useSelector(selectSearchLoading);
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const error = useSelector(selectSearchError);

  const evaluateType = () => {
    if (keyword.trim().length === 60) {
      if (/^[A-Z\s]+$/.test(keyword.trim())) {
        return 'address';
      }
      if (/^[a-z]+$/.test(keyword.trim())) {
        return 'tx';
      }
    } else if (parseInt(keyword.replace(/,/g, ''), 10).toString().length === 8) {
      return 'tick';
    }
    return '';
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && keyword !== '') {
      const type = evaluateType();
      event.preventDefault();
      if (type === 'address') {
        navigate(`/network/address/${keyword.trim()}`);
      } else if (type === 'tx') {
        navigate(`/network/tx/${keyword.trim()}`);
      } else if (type === 'tick') {
        navigate(`/network/tick/${parseInt(keyword.replace(/,/g, ''), 10)}`);
      } else {
        navigate('/404');
      }
      handleClose();
    }
  };
  useEffect(() => {
    const timerId = setTimeout(() => {
      const type = evaluateType();
      if (keyword && keyword.length > 1) {
        dispatch(getSearch({ query: keyword.trim(), type }));
      }
    }, 1000);
    return () => clearTimeout(timerId);
  }, [keyword, dispatch]);

  const handleClose = () => {
    setOpen(false);
    dispatch(resetSearch());
    setKeyword('');
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
                <img
                  className={`w-16 h-16 ${theme.direction === 'rtl' ? 'ml-10' : 'mr-10'}`}
                  src="assets/icons/magnify.svg"
                  alt="search"
                />
              }
              onChange={(e) => {
                setKeyword(e.target.value);
              }}
              onKeyDown={handleKeyPress}
            />
            <IconButton className="absolute right-12 sm:right-24" onClick={handleClose}>
              <img className="w-24 h-24" src="assets/icons/xmark.svg" alt="xmark" />
            </IconButton>
          </motion.div>
          {error && (
            <div className="mt-12 max-w-[800px] mx-auto">
              <Typography className="text-center font-space ">No result</Typography>
            </div>
          )}
          {searchResult && (
            <div className="max-h-[320px] overflow-auto max-w-[800px] mx-auto">
              {searchResult?.balance && (
                <ResultItem
                  icon={
                    <img className="w-16 h-16 mr-6" src="assets/icons/grid-add.svg" alt="address" />
                  }
                  title="Qubic Address"
                  link={`/network/address/${searchResult?.balance?.id}`}
                  content={
                    <p>
                      {searchResult?.balance?.id} <span className="text-gray-50">Balance:</span>{' '}
                      {formatString(searchResult?.balance?.balance)}
                    </p>
                  }
                />
              )}
              {searchResult?.transaction && (
                <ResultItem
                  icon={
                    <img
                      className="w-16 h-16 mr-6"
                      src="assets/icons/camera.svg"
                      alt="transaction"
                    />
                  }
                  title="Transaction"
                  content={
                    <p>
                      {searchResult?.transaction?.txId} <span className="text-gray-50">Tick:</span>{' '}
                      {formatString(searchResult?.transaction?.tickNumber)}
                    </p>
                  }
                  link={`/network/tx/${searchResult?.transaction?.txId}`}
                />
              )}
              {searchResult?.tickData && (
                <ResultItem
                  icon={<img className="w-16 h-16 mr-6" src="assets/icons/camera.svg" alt="tick" />}
                  title="Tick"
                  content={
                    <p>
                      {formatBase64(searchResult?.tickData?.signatureHex)}{' '}
                      <span className="text-gray-50">from</span>{' '}
                      {formatDate(searchResult?.tickData?.timestamp)}
                    </p>
                  }
                  link={`/network/tick/${searchResult?.tickData?.tickNumber}`}
                  items={searchResult?.tickData?.transactionIds}
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
