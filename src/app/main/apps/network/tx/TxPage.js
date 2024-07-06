import InfoIcon from '@mui/icons-material/InfoOutlined';
import { Breadcrumbs, LinearProgress, Typography } from '@mui/material';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { formatEllipsis } from 'src/app/utils/functions';
import HomeLink from '../components/HomeLink';
import TickLink from '../components/TickLink';
import TxItem from '../components/TxItem';
import { getTx, selectTx, selectTxLoading } from '../store/tx/txSlice';

function TxPage() {
  const { t } = useTranslation('networkPage');
  const dispatch = useDispatch();

  const routeParams = useParams();
  const { txId } = routeParams;
  const isLoading = useSelector(selectTxLoading);
  const tx = useSelector(selectTx);

  const urlSearchParams = new URLSearchParams(window.location.search);
  const txType = urlSearchParams.get('type');

  const getNonExecutedTxIds = (status) => {
    return status?.moneyFlew ? [] : [status?.txId];
  };

  useEffect(() => {
    dispatch(getTx({ txId, txType }));
  }, [txId, txType, dispatch]);

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
            {txType === 'historical' && (
              <div className="flex items-start sm:items-center justify-center gap-4 bg-[#122B35] p-12 mb-24 rounded-12">
                <InfoIcon className="h-16 w-16 text-primary-50" />
                <Typography className="text-12  text-primary-40 w-fit">
                  {t('historicalDataWarning')}
                </Typography>
              </div>
            )}
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
            {tx?.tx && (
              <TxItem
                {...tx?.tx}
                nonExecutedTxIds={getNonExecutedTxIds(tx?.status)}
                variant="secondary"
              />
            )}
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
