import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useSearchParams } from 'react-router-dom';
import { Breadcrumbs, LinearProgress, Typography } from '@mui/material';
import { formatEllipsis, formatString } from 'src/app/utils/functions';
import { useTranslation } from 'react-i18next';
import AddressLink from '../component/AddressLink';
import TxLink from '../component/TxLink';
import TxStatus from '../component/TxStatus';
import CardItem from '../component/CardItem';
import TickLink from '../component/TickLink';

import { getAddress, selectAddress, selectAddressLoading } from '../store/addressSlice';
import HomeLink from '../component/HomeLink';

function AddressPage() {
  const { t } = useTranslation('networkPage');
  const routeParams = useParams();
  const { addressId } = routeParams;

  const [searchParams] = useSearchParams();
  const tick = searchParams.get('tick');
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAddress(addressId));
  }, [addressId, dispatch]);

  const address = useSelector(selectAddress);
  const isLoading = useSelector(selectAddressLoading);

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
        <div className="flex flex-col gap-12">
          {address &&
            address?.latestTransfers?.map((item) => (
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
                          {formatString(item.type)} {t('standard')}
                        </Typography>
                      </div>
                      <div className="flex flex-col gap-5 md:items-end">
                        <Typography className="text-14 leading-18 font-space text-gray-50">
                          {t('amount')}
                        </Typography>
                        <Typography className="text-14 leading-18 font-space">
                          {formatString(item.amount)} QUBIC
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

export default AddressPage;
