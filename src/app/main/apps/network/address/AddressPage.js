import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useParams, useSearchParams } from 'react-router-dom';
import { Breadcrumbs, LinearProgress, Typography } from '@mui/material';
import { formatEllipsis, formatString } from 'src/app/utils/functions';
import { useTranslation } from 'react-i18next';
import TxItem from '../component/TxItem';

import CardItem from '../component/CardItem';
import TickLink from '../component/TickLink';
import HomeLink from '../component/HomeLink';
import { getAddress, selectAddress, selectAddressLoading } from '../store/addressSlice';

function AddressPage() {
  const { t } = useTranslation('networkPage');
  const routeParams = useParams();
  const { addressId } = routeParams;
  const [searchParams] = useSearchParams();
  const tick = searchParams.get('tick');
  const address = useSelector(selectAddress);
  const isLoading = useSelector(selectAddressLoading);
  const [displayTransactions, setDisplayTransactions] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const batchSize = 5;
  const scrollRef = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAddress(addressId));
  }, [addressId, dispatch]);

  useEffect(() => {
    if (address && address.latestTransfers) {
      setDisplayTransactions(address.latestTransfers.slice(0, batchSize));
      setHasMore(address.latestTransfers.length > batchSize);
    }
  }, [address]);

  const loadMoreTransactions = () => {
    if (displayTransactions.length < address.latestTransfers.length) {
      const nextTransactions = address.latestTransfers.slice(
        displayTransactions.length,
        displayTransactions.length + batchSize
      );
      setDisplayTransactions((prevTransactions) => [...prevTransactions, ...nextTransactions]);
      setHasMore(displayTransactions.length + batchSize < address.latestTransfers.length);
    } else {
      setHasMore(false);
    }
  };

  useEffect(() => {
    const scrollElement = scrollRef.current;
    const handleScroll = () => {
      if (scrollElement.scrollTop + scrollElement.clientHeight >= scrollElement.scrollHeight) {
        console.log('Reached the bottom!');
      }
    };

    scrollElement.addEventListener('scroll', handleScroll);
    return () => scrollElement.removeEventListener('scroll', handleScroll);
  }, []);

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
          <Typography className="text-12 font-space text-gray-50">
            {t('tick')} <TickLink value={tick} className="text-12" />
          </Typography>
          <Typography className="text-12 font-space text-primary-40 ">
            {formatEllipsis(address?.id)}
          </Typography>
        </Breadcrumbs>
        <Typography className="font-space text-16 leading-20 mt-32 mb-12 text-gray-50">
          {t('id')}
        </Typography>
        <Typography className="font-space text-24 leading-30 mb-32 break-all">
          {address?.id}
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
        <Typography className="text-20 leading-26 font-500 font-space mb-16">
          {t('latestTransfers')}
        </Typography>
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
              <TxItem key={index} {...item} />
            ))}
          </div>
        </InfiniteScroll>
      </div>
    </div>
  );
}

export default AddressPage;
