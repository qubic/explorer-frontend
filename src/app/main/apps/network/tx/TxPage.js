import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Breadcrumbs, LinearProgress, Typography } from '@mui/material';

import { formatEllipsis } from 'src/app/utils/functions';
import { useTranslation } from 'react-i18next';
import ErrorMessage from '../component/ErrorMessage';
import TxStatus from '../component/TxStatus';
import TxLink from '../component/TxLink';
import TickLink from '../component/TickLink';
import { getTx, selectTx, selectTxLoading } from '../store/txSlice';
import AddressLink from '../component/AddressLink';
import SubCardItem from '../component/SubCardItem';
import HomeLink from '../component/HomeLink';

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
        <div className="flex flex-col md:flex-row md:items-center gap-10 md:gap-16 mb-24">
          <div className="">
            <TxStatus executed={tx?.executed} />
          </div>
          <TxLink value={tx?.id} />
        </div>
        <SubCardItem
          title={t('amount')}
          content={
            <Typography className="text-14 leading-20 font-space">{tx?.amount} QUBIC</Typography>
          }
        />
        <SubCardItem
          title={t('type')}
          content={
            <Typography className="text-14 leading-20 font-space">
              {tx?.type} {t('standard')}
            </Typography>
          }
        />
        <SubCardItem title={t('source')} content={<AddressLink value={tx?.sourceId} />} />
        <SubCardItem title={t('destination')} content={<AddressLink value={tx?.destId} />} />
      </div>
    </div>
  );
}

export default TxPage;
