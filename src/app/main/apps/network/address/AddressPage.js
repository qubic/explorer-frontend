import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Breadcrumbs, IconButton, LinearProgress, Tab, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { formatEllipsis, formatString } from 'src/app/utils/functions';
import { CardItem, CopyText, HomeLink, TickLink } from '../component';
import { getAddress, selectAddress, selectAddressLoading } from '../store/address/addressSlice';
import { getOverview, selectOverview } from '../store/overviewSlice';
import HistoricalTxs from './HistoricalTxs';
import Transactions from './Transactions';

function AddressPage() {
  const { t } = useTranslation('networkPage');
  const dispatch = useDispatch();
  const { addressId } = useParams();

  const address = useSelector(selectAddress);
  const overview = useSelector(selectOverview);
  const isLoading = useSelector(selectAddressLoading);

  const [entityOpen, setEntityOpen] = useState(false);
  const [value, setValue] = useState('1');

  const handleTabChange = (_event, newValue) => {
    setValue(newValue);
  };

  useEffect(() => {
    dispatch(getAddress(addressId));
    if (!overview) {
      dispatch(getOverview());
    }
  }, [addressId, dispatch, overview]);

  if (isLoading) {
    return (
      <div className="w-full absolute">
        <LinearProgress />
      </div>
    );
  }

  return (
    <div className="w-full max-h-[calc(100vh-76px)] overflow-y-auto">
      <div className="py-16 max-w-[960px] mx-auto px-12">
        <Breadcrumbs aria-label="breadcrumbs" className="py-16">
          <HomeLink />
          <Typography className="text-12 font-space text-primary-40 ">
            {t('id')} {formatEllipsis(addressId)}
          </Typography>
        </Breadcrumbs>
        <div className="flex items-center gap-12 pt-16 pb-8">
          <Typography className="font-space text-16 text-gray-50 leading-20 break-all">
            {addressId}
          </Typography>
          <CopyText text={addressId} />
        </div>
        <div>
          <div className="flex flex-col">
            <div className="flex gap-10">
              <Typography className="font-space text-24 sm:text-36 leading-30 break-all w-fit">
                {formatString(address?.balance?.balance)}{' '}
                <span className="text-gray-50">QUBIC</span>
              </Typography>
              <IconButton className="rounded-8 p-0" onClick={() => setEntityOpen((prev) => !prev)}>
                <img
                  className={`w-16 transition-transform duration-300 ${
                    entityOpen ? 'rotate-180' : 'rotate-0'
                  }`}
                  src="assets/icons/arrow-gray.svg"
                  alt="arrow"
                />
              </IconButton>
            </div>
            <Typography className="text-16 leading-18 font-space text-gray-50 my-5">
              ${formatString((address?.balance?.balance * overview?.price).toFixed(2))}
            </Typography>
          </div>
          {entityOpen && (
            <div className="grid 948px:grid-cols-3 gap-16 pt-12">
              {address &&
                (Object.entries(address?.reportedValues) || []).map(([ip, details]) => (
                  <CardItem className="p-16" key={ip}>
                    <div className="flex justify-between mb-16">
                      <div className="">
                        <Typography className="text-14 leading-18 font-space text-gray-50">
                          {t('value')}
                        </Typography>
                        <Typography className="text-16 leading-20 font-space font-500">
                          {formatString(details.incomingAmount - details.outgoingAmount)}{' '}
                          <span className="text-gray-50">QUBIC</span>
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
          )}
        </div>
        <div className="mt-40">
          <Typography className="text-20 leading-26 font-500 font-space my-10">
            {t('transactions')}
          </Typography>
          <TabContext value={value}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <TabList onChange={handleTabChange} textColor="secondary" indicatorColor="secondary">
                <Tab label={t('latest')} value="1" className="font-space" />
                <Tab label={t('historical')} value="2" className="font-space" />
              </TabList>
            </Box>
            <TabPanel value="1" sx={{ paddingX: 0 }}>
              <Transactions addressId={addressId} address={address} />
            </TabPanel>
            <TabPanel value="2" sx={{ paddingX: 0 }}>
              <HistoricalTxs addressId={addressId} />
            </TabPanel>
          </TabContext>
        </div>
      </div>
    </div>
  );
}

export default AddressPage;
