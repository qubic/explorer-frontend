import { Typography, IconButton } from '@mui/material';
import { fetchEntries, formatString } from 'src/app/utils/functions';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import CardItem from './CardItem';
import TxLink from './TxLink';
import TxStatus from './TxStatus';
import AddressLink from './AddressLink';
import SubCardItem from './SubCardItem';
import TickLink from './TickLink';

function TxItem(props) {
  const { t } = useTranslation('networkPage');
  const [entries, setEntries] = useState([]);
  const [entriesOpen, setEntriesOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const {
    identify,
    txId,
    sourceId,
    tickNumber,
    destId,
    inputType,
    amount,
    inputHex,
    nonExecutedTxIds,
    variant,
  } = props;

  useEffect(() => {
    if (
      destId === 'EAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVWRF' &&
      inputType === 1 &&
      inputHex
    ) {
      fetchEntries(inputHex)
        .then((resp) => {
          setEntries(resp);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, []);

  if (variant === 'primary') {
    return (
      <CardItem className="flex flex-col p-12 transition-all duration-300">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex gap-8">
            <TxStatus executed={!(nonExecutedTxIds || []).includes(txId)} />
            {identify && (
              <img
                src={`assets/icons/arrow-${identify === sourceId ? 'down' : 'up'}.svg`}
                alt="arrow"
              />
            )}
            {identify ? (
              <AddressLink
                value={identify === sourceId ? destId : sourceId}
                className="text-primary-40"
                ellipsis
                copy
              />
            ) : (
              <TxLink value={txId} className="text-primary-40" ellipsis copy />
            )}
          </div>
          <IconButton className="rounded-8 p-0" onClick={() => setDetailsOpen((prev) => !prev)}>
            <Typography className="text-center font-space text-14 mr-12 " role="button">
              {formatString(amount)} QUBIC
            </Typography>
            <img
              className={`w-16 transition-transform duration-300 ${
                detailsOpen ? 'rotate-180' : 'rotate-0'
              }`}
              src="assets/icons/arrow-gray.svg"
              alt="arrow"
            />
          </IconButton>
        </div>
        {detailsOpen && (
          <div className="flex flex-col gap-12 pt-12 mt-14 border-t-[1px] border-gray-70">
            <SubCardItem
              title={`TX ${t('id')}`}
              variant="primary"
              content={<TxLink className="text-primary-40 text-14" value={txId} copy />}
            />
            <SubCardItem
              title={t('source')}
              variant="primary"
              content={<AddressLink value={sourceId} copy />}
            />
            <SubCardItem
              title={t('destination')}
              variant="primary"
              content={<AddressLink value={destId} copy />}
            />
            <SubCardItem
              title={t('tick')}
              variant="primary"
              content={<TickLink className="text-primary-40" value={tickNumber} />}
            />
            <SubCardItem
              title={t('type')}
              variant="primary"
              content={
                <Typography className="text-14 leading-18 font-space">
                  {formatString(inputType)} {inputType === 0 ? 'Standard' : 'SC'}
                </Typography>
              }
            />
            {entries.length !== 0 && entriesOpen && (
              <div
                className={`my-8 p-12 bg-gray-70 flex flex-col gap-8 rounded-8 transition-all duration-300 ${
                  entriesOpen ? 'h-auto' : 'h-0'
                }`}
              >
                <div className="flex justify-between">
                  <Typography className="text-14 leading-18 font-space text-gray-50">
                    {t('destination')}
                  </Typography>
                  <Typography className="text-14 leading-18 font-space text-gray-50 hidden md:block">
                    {t('amount')}
                  </Typography>
                </div>
                <div className="">
                  {entries.map((item, index) => (
                    <div
                      className="flex justify-between flex-col md:flex-row gap-8 py-8"
                      key={index}
                    >
                      <AddressLink value={item.destId} />
                      <Typography className="text-14 leading-18 font-space">
                        {formatString(item.amount)} QUBIC
                      </Typography>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {entries.length !== 0 && (
              <div className="text-center">
                <IconButton className="rounded-8" onClick={() => setEntriesOpen((prev) => !prev)}>
                  <Typography className="text-center font-space text-14 mr-12 " role="button">
                    {entriesOpen ? 'Hide' : 'Show'} {entries.length} transactions
                  </Typography>
                  <img
                    className={`w-16 transition-transform duration-300 ${
                      entriesOpen ? 'rotate-180' : 'rotate-0'
                    }`}
                    src="assets/icons/arrow-gray.svg"
                    alt="arrow"
                  />
                </IconButton>
              </div>
            )}
          </div>
        )}
      </CardItem>
    );
  }

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center gap-10 md:gap-16 mb-24">
        <div className="">
          <TxStatus executed={!(nonExecutedTxIds || []).includes(txId)} />
        </div>
        <TxLink className="text-16 text-gray-50" value={txId} />
      </div>
      <SubCardItem
        title={t('amount')}
        content={
          <Typography className="text-14 leading-20 font-space">
            {formatString(amount)} QUBIC
          </Typography>
        }
      />
      <SubCardItem
        title={t('type')}
        content={
          <Typography className="text-14 leading-20 font-space">
            {formatString(inputType)} {inputType === 0 ? 'Standard' : 'SC'}
          </Typography>
        }
      />
      <SubCardItem title={t('source')} content={<AddressLink value={sourceId} />} />
      <SubCardItem title={t('destination')} content={<AddressLink value={destId} />} />
      <SubCardItem
        title={t('tick')}
        content={<TickLink className="text-primary-40" value={tickNumber} />}
      />
      {entries.length !== 0 && (
        <>
          <Typography className="text-18 leading-20 font-space py-12">
            {entries.length} transactions
          </Typography>
          <CardItem className="p-12 md:p-16 flex flex-col gap-8">
            <div className="flex justify-between">
              <Typography className="text-14 leading-18 font-space text-gray-50">
                {t('destination')}
              </Typography>
              <Typography className="text-14 leading-18 font-space text-gray-50 hidden md:block">
                {t('amount')}
              </Typography>
            </div>
            <div className="">
              {entries.map((item, index) => (
                <div
                  className={`flex justify-between flex-col md:flex-row gap-8 ${
                    index !== entries.length - 1 ? 'border-b-[1px] py-12 ' : 'pt-12'
                  }`}
                  key={index}
                >
                  <AddressLink value={item.destId} />
                  <Typography className="text-14 leading-18 font-space">
                    {formatString(item.amount)} QUBIC
                  </Typography>
                </div>
              ))}
            </div>
          </CardItem>
        </>
      )}
    </>
  );
}

export default TxItem;
