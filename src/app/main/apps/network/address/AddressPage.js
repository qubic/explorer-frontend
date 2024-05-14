import { useEffect, useState, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useParams } from 'react-router-dom';
import { Breadcrumbs, LinearProgress, MenuItem, Select, Typography } from '@mui/material';
import { formatEllipsis, formatString } from 'src/app/utils/functions';
import { useTranslation } from 'react-i18next';
import { transactionOptions } from 'src/app/utils/constants';
import { ArrowIcon } from 'src/assets/icons/svg';
import TxItem from '../component/TxItem';

import CardItem from '../component/CardItem';
import TickLink from '../component/TickLink';
import HomeLink from '../component/HomeLink';
import { getAddress, selectAddress, selectAddressLoading } from '../store/addressSlice';

function AddressPage() {
  const { t } = useTranslation('networkPage');
  const routeParams = useParams();
  const { addressId } = routeParams;
  const address = useSelector(selectAddress);
  const isLoading = useSelector(selectAddressLoading);
  const [displayTransactions, setDisplayTransactions] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [option, setOption] = useState('transfer');
  const batchSize = 5;
  const scrollRef = useRef(null);
  const dispatch = useDispatch();

  const latestTransfers = useMemo(() => {
    return (address?.transferTx || [])
      .flatMap((item) => item.transactions)
      .sort((a, b) => b.tickNumber - a.tickNumber);
  }, [address]);

  useEffect(() => {
    dispatch(getAddress(addressId));
  }, [addressId, dispatch]);

  useEffect(() => {
    if (latestTransfers) {
      setDisplayTransactions(latestTransfers.slice(0, batchSize));
      setHasMore(latestTransfers.length > batchSize);
    }
  }, [address]);

  const loadMoreTransactions = () => {
    if (displayTransactions.length < latestTransfers.length) {
      const nextTransactions = latestTransfers.slice(
        displayTransactions.length,
        displayTransactions.length + batchSize
      );
      setDisplayTransactions((prevTransactions) => [...prevTransactions, ...nextTransactions]);
      setHasMore(displayTransactions.length + batchSize < latestTransfers.length);
    } else {
      setHasMore(false);
    }
  };

  useEffect(() => {
    const scrollElement = scrollRef.current;
    const handleScroll = () => {
      if (scrollElement.scrollTop + scrollElement.clientHeight >= scrollElement.scrollHeight) {
        console.log('');
      }
    };

    scrollElement.addEventListener('scroll', handleScroll);
    return () => scrollElement.removeEventListener('scroll', handleScroll);
  }, []);

  const handleChange = (event) => {
    setOption(event.target.value);
  };

  if (isLoading) {
    return (
      <div className="w-full absolute">
        <LinearProgress />
      </div>
    );
  }

  return (
    <div
      className="w-full max-h-[calc(100vh-76px)] overflow-y-auto"
      id="scrollableDiv"
      ref={scrollRef}
    >
      <div className="py-32 max-w-[960px] mx-auto px-12">
        <Breadcrumbs aria-label="breadcrumbs">
          <HomeLink />
          <Typography className="text-12 font-space text-primary-40 ">
            {t('id')} {formatEllipsis(addressId)}
          </Typography>
        </Breadcrumbs>
        <Typography className="font-space text-24 leading-30 my-32 break-all">
          {addressId}
        </Typography>
        <Typography className="font-space text-14 leading-18 mb-12">
          {t('entityReportsFromRandomPeers')}
        </Typography>
        <div className="grid 948px:grid-cols-3 gap-16 mb-32">
          {address &&
            Object.entries(address?.reportedValues).map(([ip, details]) => (
              <CardItem className="p-16" key={ip}>
                <div className="flex justify-between mb-16">
                  <div className="">
                    <Typography className="text-14 leading-18 font-space text-gray-50">
                      {t('value')}
                    </Typography>
                    <Typography className="text-16 leading-20 font-space font-500">
                      {formatString(details.incomingAmount - details.outgoingAmount)} QUBIC
                    </Typography>
                  </div>
                  <Typography className="text-14 leading-18 font-space text-gray-50">
                    {ip}
                  </Typography>
                </div>
                <div className="flex flex-col items-center 948px:items-start gap-8">
                  <Typography className="text-14 leading-18 font-space text-gray-50">
                    {t('incoming')}:
                    <span className="text-white"> {details.numberOfIncomingTransfers} </span>(
                    {t('latest')}:{' '}
                    <TickLink
                      value={details.latestIncomingTransferTick}
                      className="text-primary-40 break-all"
                    />
                    )
                  </Typography>
                  <Typography className="text-14 leading-18 font-space text-gray-50">
                    {t('outgoing')}:
                    <span className="text-white"> {details.numberOfOutgoingTransfers} </span>(
                    {t('latest')}:{' '}
                    <TickLink
                      value={details.latestOutgoingTransferTick}
                      className="text-primary-40 break-all"
                    />
                    )
                  </Typography>
                </div>
              </CardItem>
            ))}
        </div>
        <div className="flex justify-between items-center mb-10">
          <Typography className="text-20 leading-26 font-500 font-space mb-16">
            {t('latestTransfers')}
          </Typography>
          <Select
            value={option}
            onChange={handleChange}
            className="border-gray-70 bg-gray-80 rounded-8 focus:border-gray-60"
            IconComponent={ArrowIcon}
            sx={{
              minWidth: 225,
              '&.Mui-focused fieldset': {
                borderColor: '#4B5565 !important', // Your desired border color
              },
            }}
          >
            {transactionOptions
              .filter((item) => item.id === 'transfer')
              .map((item) => (
                <MenuItem className="py-10 min-w-[164px]" key={item.id} value={item.id}>
                  <Typography className="text-16 leading-20 font-space">{item.title}</Typography>
                </MenuItem>
              ))}
          </Select>
        </div>
        <InfiniteScroll
          dataLength={displayTransactions.length}
          next={loadMoreTransactions}
          hasMore={hasMore}
          scrollableTarget="scrollableDiv"
          loader={
            <Typography className="text-14 text-primary-50 font-bold py-10 text-center">
              Loading...
            </Typography>
          }
          endMessage={
            displayTransactions.length === 0 ? (
              <Typography className="text-14 font-bold py-10 text-center">
                There are no transactions
              </Typography>
            ) : (
              <Typography className="text-14 font-bold py-10 text-center">
                You have seen all transactions
              </Typography>
            )
          }
        >
          <div className="flex flex-col gap-12">
            {displayTransactions.map((item, index) => (
              <TxItem key={index} {...item} variant="primary" />
            ))}
          </div>
        </InfiniteScroll>
      </div>
    </div>
  );
}

export default AddressPage;
