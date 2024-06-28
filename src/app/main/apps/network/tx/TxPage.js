import { Breadcrumbs, LinearProgress, Typography } from '@mui/material';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { useTranslation } from 'react-i18next';
import { formatEllipsis } from 'src/app/utils/functions';
import HomeLink from '../components/HomeLink';
import TickLink from '../components/TickLink';
import TxItem from '../components/TxItem';
import { getTx, selectTx, selectTxLoading } from '../store/txSlice';

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
      <div className="py-32 max-w-[960px] mx-auto px-12">
        {tx?.tx ? (
          <>
            <Breadcrumbs aria-label="breadcrumb">
              <HomeLink />
              <Typography className="text-12 font-space text-gray-50">
                {t('tick')} <TickLink value={tx?.tx?.tickNumber} className="text-12" />
              </Typography>
              <Typography className="text-12 font-space text-primary-40 ">
                {formatEllipsis(tx?.tx?.txId)}
              </Typography>
            </Breadcrumbs>
            <Typography className="text-24 leading-28 font-space my-16">
              {t('transactionPreview')}
            </Typography>
            {tx?.tx && <TxItem {...tx?.tx} variant="secondary" />}
          </>
        ) : (
          <Typography className="text-24 leading-28 font-space my-16 text-center">
            Transaction not found
          </Typography>
        )}
      </div>
    </div>
  );
}

export default TxPage;
