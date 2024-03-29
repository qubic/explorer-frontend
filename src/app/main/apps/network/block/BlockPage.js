import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Breadcrumbs, IconButton, LinearProgress, Typography } from '@mui/material';
import { formatDate, formatString } from 'src/app/utils/functions';
import { useNavigate, useParams } from 'react-router-dom';

import { useTranslation } from 'react-i18next';
import { getBlock, selectBlock, selectBlockLoading } from '../store/blockSlice';
import AddressLink from '../component/AddressLink';
import TxLink from '../component/TxLink';
import TxStatus from '../component/TxStatus';
import SubCardItem from '../component/SubCardItem';
import TickStatus from '../component/TickStatus';
import HomeLink from '../component/HomeLink';
import CardItem from '../component/CardItem';

function BlockPage() {
  const { t } = useTranslation('networkPage');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const routeParams = useParams();

  const { tick } = routeParams;

  useEffect(() => {
    dispatch(getBlock(tick));
  }, [tick, dispatch]);

  const block = useSelector(selectBlock);
  const isLoading = useSelector(selectBlockLoading);

  if (isLoading) {
    return (
      <div className="w-full absolute">
        <LinearProgress />
      </div>
    );
  }

  return (
    <div className="w-full ">
      <div className="py-32 max-w-[960px] mx-auto px-12">
        <Breadcrumbs aria-label="breadcrumb">
          <HomeLink />
          <Typography className="text-12 text-primary-40">
            {t('tick')} {formatString(tick)}
          </Typography>
        </Breadcrumbs>
        <div className="flex justify-between gap-12 items-center mt-24 mb-36">
          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-8">
              <IconButton onClick={() => navigate(`/network/block/${Number(tick) - 1}`)}>
                <img className="w-24 h-24" src="assets/icons/arrow-left.svg" alt="icon" />
              </IconButton>
              <Typography className="text-32 leading-40 font-500 font-space">
                {formatString(block?.tick)}
              </Typography>
              <IconButton onClick={() => navigate(`/network/block/${Number(tick) + 1}`)}>
                <img className="w-24 h-24" src="assets/icons/arrow-right.svg" alt="icon" />
              </IconButton>
            </div>
            <Typography className="text-14 leading-20 font-space text-gray-50">
              {formatDate(block?.timestamp)}
            </Typography>
          </div>
          <div className="hidden md:block">
            <TickStatus
              dataStatus={block?.completed}
              tickStatus={block?.isNonEmpty}
              numberOfTx={block?.numberOfTx}
            />
          </div>
        </div>
        <div className="mb-24">
          <SubCardItem
            title={t('signature')}
            content={
              <Typography className="text-14 leading-20 font-space text-gray-50 break-all">
                {block?.signature}
              </Typography>
            }
          />
          <SubCardItem
            title={t('tickLeader')}
            content={<AddressLink value={block?.tickLeaderId} tickValue={block?.tick} />}
          />
        </div>
        <div className="mb-24 md:hidden">
          <TickStatus
            dataStatus={block?.completed}
            tickStatus={block?.isNonEmpty}
            numberOfTx={block?.numberOfTx}
          />
        </div>
        <Typography className="text-20 leading-26 font-500 font-space mb-16">
          {t('transactions')}
        </Typography>
        <div className="flex flex-col gap-12">
          {block &&
            block?.transactions?.map((item) => (
              <CardItem className="flex flex-col p-12" key={item.id}>
                <div className="flex flex-col md:flex-row md:items-center gap-10 md:gap-16 mb-14">
                  <div className="">
                    <TxStatus executed={item.executed} />
                  </div>
                  <TxLink value={item.id} />
                </div>
                <div className="flex flex-col pt-14 border-t-[1px] border-gray-70">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-16">
                    <div className="flex flex-col gap-16">
                      <div className="flex flex-col gap-8">
                        <Typography className="text-14 leading-18 font-space text-gray-50">
                          {t('source')}
                        </Typography>
                        <AddressLink value={item.sourceId} tickValue={tick} />
                      </div>
                      <div className="flex flex-col gap-8">
                        <Typography className="text-14 leading-18 font-space text-gray-50">
                          {t('destination')}
                        </Typography>
                        <AddressLink value={item.destId} tickValue={tick} />
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row md:flex-col gap-24 pr-24">
                      <div className="flex flex-col gap-5 md:items-end">
                        <Typography className="text-14 leading-18 font-space text-gray-50">
                          {t('type')}
                        </Typography>
                        <Typography className="text-14 leading-18 font-space">
                          {item.type} {t('standard')}
                        </Typography>
                      </div>
                      <div className="flex flex-col gap-5 md:items-end">
                        <Typography className="text-14 leading-18 font-space text-gray-50">
                          {t('amount')}
                        </Typography>
                        <Typography className="text-14 leading-18 font-space">
                          {item.amount} QUBIC
                        </Typography>
                      </div>
                    </div>
                  </div>
                </div>
              </CardItem>
            ))}
        </div>
      </div>
    </div>
  );
}

export default BlockPage;
