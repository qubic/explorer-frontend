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
    if (historicalTxs.length === 0) {
      dispatch(getHistoricalTxs({ addressId }));
    }
  }, [dispatch, addressId, historicalTxs]);

  const fetchMoreTxs = () => {
    dispatch(getHistoricalTxs({ addressId }));
  };

  const renderTxItem = useCallback(
    (item) => (
      <TxItem
        key={item.txId}
        {...item}
        identify={addressId}
        variant="primary"
        isHistoricalTx
        nonExecutedTxIds={item?.moneyFlew ? [] : [item?.txId]}
      />
    ),
    [addressId]
  );

  return (
    <div className="w-full grid gap-10">
      {(!isLoading || historicalTxs.length > 0) && (
        <div className="flex items-center gap-4 pb-14">
          <img src="assets/icons/information.svg" alt="info-icon" className="h-16 w-16" />
          <Typography className="text-14 text-left text-gray-50">
            {t('historicalDataWarning')}
          </Typography>
        </div>
      )}
      <div className="flex flex-col gap-12">{historicalTxs.map((item) => renderTxItem(item))}</div>
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
