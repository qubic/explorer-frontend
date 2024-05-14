import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Breadcrumbs, LinearProgress, Typography } from '@mui/material';

import { formatEllipsis } from 'src/app/utils/functions';
import { useTranslation } from 'react-i18next';
import ErrorMessage from '../component/ErrorMessage';
import TickLink from '../component/TickLink';
import { getTx, selectTx, selectTxLoading } from '../store/txSlice';
import HomeLink from '../component/HomeLink';
import TxItem from '../component/TxItem';

function TxPage() {
  const { t } = useTranslation('networkPage');
  const dispatch = useDispatch();

  const routeParams = useParams();
  const { txId } = routeParams;

  useEffect(() => {
    dispatch(getTx(txId));
  }, [txId, dispatch]);

  const tx = useSelector(selectTx);
  const isLoading = useSelector(selectTxLoading);

  if (isLoading) {
    return (
      <div className="w-full absolute">
        <LinearProgress />
      </div>
    );
  }

  return (
    <div className="w-full">
      <ErrorMessage />
      <div className="py-24 max-w-[960px] mx-auto px-12">
        <Breadcrumbs aria-label="breadcrumb">
          <HomeLink />
          <Typography className="text-12 font-space text-gray-50">
            {t('tick')} <TickLink value={tx?.tick} className="text-12" />
          </Typography>
          <Typography className="text-12 font-space text-primary-40 ">
            {formatEllipsis(tx?.id)}
          </Typography>
        </Breadcrumbs>
        <Typography className="text-24 leading-28 font-space my-16">
          {t('transactionPreview')}
        </Typography>
        {tx && <TxItem {...tx} variant="secondary" />}
      </div>
    </div>
  );
}

export default TxPage;
