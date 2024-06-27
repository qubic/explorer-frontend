import FuseLoading from '@fuse/core/FuseLoading';
import { Alert, Button, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { TxItem } from '../components';
import { getTransferTxs, selectTransferTxs, setLastEndTick } from '../store/address/addressSlice';
import { BATCH_SIZE, TICK_SIZE } from './constants';

export default function Transactions({ addressId, address }) {
  const { t } = useTranslation('networkPage');
  const dispatch = useDispatch();
  const {
    data: transferTxs,
    isLoading,
    error,
    hasMore,
    lastStartTick,
    lastEndTick,
  } = useSelector(selectTransferTxs);

  const [displayTransferTxs, setDisplayTransferTxs] = useState([]);
  const [endTick, setEndTick] = useState(address?.endTick);
  const [startTick, setStartTick] = useState(address?.endTick - TICK_SIZE + 1);

  const fetchMoreTxs = useCallback(() => {
    if (!isLoading && hasMore && endTick) {
      const newEndTick = Math.max(0, lastEndTick || endTick - TICK_SIZE);
      const newStartTick = Math.max(0, lastStartTick || newEndTick - TICK_SIZE + 1);

      dispatch(getTransferTxs({ addressId, startTick: newStartTick, endTick: newEndTick }));
      setEndTick(newEndTick);
      setStartTick(newStartTick);
    }
  }, [isLoading, hasMore, endTick, lastEndTick, lastStartTick, dispatch, addressId]);

  const loadMore = useCallback(() => {
    const remainingTxs = transferTxs.slice(
      displayTransferTxs.length,
      displayTransferTxs.length + BATCH_SIZE
    );
    if (remainingTxs.length >= BATCH_SIZE) {
      setDisplayTransferTxs((prev) => [...prev, ...remainingTxs]);
    } else if (hasMore && !isLoading) {
      fetchMoreTxs();
    }
  }, [transferTxs, displayTransferTxs.length, hasMore, isLoading, fetchMoreTxs]);

  const renderTxItem = useCallback(
    (item) => <TxItem key={item.txId} {...item} identify={addressId} variant="primary" />,
    [addressId]
  );

  useEffect(() => {
    dispatch(setLastEndTick(endTick));
  }, [endTick, dispatch]);

  useEffect(() => {
    if (!transferTxs.length && endTick) {
      dispatch(getTransferTxs({ addressId, startTick, endTick }));
    }
  }, [addressId, startTick, endTick, dispatch, transferTxs.length]);

  useEffect(() => {
    if (transferTxs.length > 0) {
      setDisplayTransferTxs((prev) => [
        ...prev,
        ...transferTxs.slice(prev.length, prev.length + BATCH_SIZE),
      ]);
    }
  }, [transferTxs]);

  return (
    <div className="w-full grid gap-10">
      <div className="flex flex-col gap-12">
        {displayTransferTxs.map((item) => renderTxItem(item))}
      </div>
      {(() => {
        if (isLoading) return <FuseLoading className="sm:text-16" />;
        if (error) return <Alert severity="error">{error}</Alert>;
        if (hasMore)
          return (
            <Button onClick={loadMore} sx={{ justifySelf: 'center', marginY: 5, paddingX: 2.5 }}>
              {t('loadMore')}
            </Button>
          );
        return (
          <Typography className="text-14 py-32 text-center text-gray-50">
            {displayTransferTxs.length === 0 ? t('noTransactions') : t('allTransactionsLoaded')}
          </Typography>
        );
      })()}
    </div>
  );
}
