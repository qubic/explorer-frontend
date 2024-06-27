import FuseLoading from '@fuse/core/FuseLoading';
import { Alert, Button, Typography } from '@mui/material';
import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { TxItem } from '../components';
import { getHistoricalTxs, selectHistoricalTxs } from '../store/address/addressSlice';

export default function HistoricalTxs({ addressId }) {
  const { t } = useTranslation('networkPage');
  const dispatch = useDispatch();
  const { data: historicalTxs, isLoading, error, hasMore } = useSelector(selectHistoricalTxs);

  useEffect(() => {
    // TODO: This is a draft impl since backend need to impl pagination
    if (historicalTxs.length === 0) {
      dispatch(getHistoricalTxs({ addressId, offset: 0 }));
    }
  }, [dispatch, addressId, historicalTxs]);

  const fetchMoreTxs = () => {
    // TODO: This is a draft impl since backend need to impl pagination
    dispatch(getHistoricalTxs({ addressId, offset: historicalTxs.length / 20 }));
  };

  const renderTxItem = useCallback(
    (item) => <TxItem key={item.id} {...item} identify={addressId} variant="primary" />,
    [addressId]
  );

  return (
    <div className="w-full grid gap-10">
      <div className="flex flex-col gap-12">
        {historicalTxs.map((item) =>
          renderTxItem({ ...item, txId: item.id, tickNumber: item.tick, inputType: item.type })
        )}
      </div>
      {(() => {
        if (isLoading) return <FuseLoading className="sm:text-16" />;
        if (error) return <Alert severity="error">{error}</Alert>;
        if (hasMore)
          return (
            <Button
              onClick={fetchMoreTxs}
              sx={{ justifySelf: 'center', marginY: 5, paddingX: 2.5 }}
            >
              {t('loadMore')}
            </Button>
          );
        return (
          <Typography className="text-14 py-32 text-center text-gray-50">
            {historicalTxs.length === 0 ? t('noTransactions') : t('allTransactionsLoaded')}
          </Typography>
        );
      })()}
    </div>
  );
}
