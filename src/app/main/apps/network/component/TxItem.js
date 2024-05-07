import { Typography, IconButton } from '@mui/material';
import { formatString } from 'src/app/utils/functions';
import { useTranslation } from 'react-i18next';
import { QubicTransferSendManyPayload } from 'qubic-ts-library/dist/qubic-types/transacion-payloads/QubicTransferSendManyPayload';
import { useEffect, useState } from 'react';
import CardItem from './CardItem';
import TxLink from './TxLink';
import TxStatus from './TxStatus';
import AddressLink from './AddressLink';

function TxItem(props) {
  const { t } = useTranslation('networkPage');
  const [entries, setEntries] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const { executed, id, sourceId, tick, destId, type, amount, data, moneyFlew } = props;

  useEffect(() => {
    const fetchData = async () => {
      const binaryData = new Uint8Array(
        atob(data)
          .split('')
          .map(function (c) {
            return c.charCodeAt(0);
          })
      );
      const sendManyPayload = binaryData.slice(binaryData.length - 1064, binaryData.length - 64);

      const parsedSendManyPayload = await new QubicTransferSendManyPayload().parse(sendManyPayload);

      const transfers = parsedSendManyPayload.getTransfers();

      const standardizedData = transfers.map((item) => ({
        amount: item.amount.value.toString(),
        destId: item.destId.identity,
      }));
      setEntries(standardizedData);
    };
    if (
      destId === 'EAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVWRF' &&
      type === 1 &&
      data
    ) {
      fetchData();
    }
  }, []);

  return (
    <CardItem className="flex flex-col pt-12 px-12 transition-all duration-300">
      <div className="flex flex-col md:flex-row md:items-center gap-10 md:gap-16 mb-14">
        <div className="">
          <TxStatus executed={executed && moneyFlew} />
        </div>
        <TxLink value={id} className="text-primary-40" copy />
      </div>
      <div className="flex flex-col pt-14 pb-8 border-t-[1px] border-gray-70">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-16">
          <div className="flex flex-col gap-16">
            <div className="flex flex-col gap-8">
              <Typography className="text-14 leading-18 font-space text-gray-50">
                {t('source')}
              </Typography>
              <AddressLink value={sourceId} tickValue={tick} copy />
            </div>
            <div className="flex flex-col gap-8">
              <Typography className="text-14 leading-18 font-space text-gray-50">
                {t('destination')}
              </Typography>
              <AddressLink value={destId} tickValue={tick} copy />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row md:flex-col gap-24 pr-12">
            <div className="flex flex-col gap-5 md:items-end">
              <Typography className="text-14 leading-18 font-space text-gray-50">
                {t('type')}
              </Typography>
              <Typography className="text-14 leading-18 font-space">
                {formatString(type)} {type === 0 ? 'Standard' : 'SC'}
              </Typography>
            </div>
            <div className="flex flex-col gap-5 md:items-end">
              <Typography className="text-14 leading-18 font-space text-gray-50">
                {t('amount')}
              </Typography>
              <Typography className="text-14 leading-18 font-space">
                {formatString(amount)} QUBIC
              </Typography>
            </div>
          </div>
        </div>
      </div>
      {entries.length !== 0 && isOpen && (
        <div
          className={`p-12 bg-gray-70 flex flex-col gap-8 rounded-8 transition-all duration-300 ${
            isOpen ? 'h-auto' : 'h-0'
          }`}
        >
          <div className="flex justify-between">
            <Typography className="text-14 leading-18 font-space text-gray-50">
              {t('destination')}
            </Typography>
            <Typography className="text-14 leading-18 font-space text-gray-50">
              {t('amount')}
            </Typography>
          </div>
          {entries.map((item, index) => (
            <div className="flex justify-between flex-col md:flex-row" key={index}>
              <AddressLink value={item.destId} tickValue={tick} />
              <Typography className="text-14 leading-18 font-space">
                {formatString(item.amount)} QUBIC
              </Typography>
            </div>
          ))}
        </div>
      )}
      {entries.length !== 0 && (
        <div className="py-16 text-center">
          <IconButton className="" onClick={() => setIsOpen((prev) => !prev)}>
            <Typography className="text-center font-space text-14 mr-12" role="button">
              {isOpen ? 'Hide' : 'Show'} {entries.length} entries
            </Typography>
            <img
              className={`w-16 transition-transform duration-300 ${
                isOpen ? 'rotate-180' : 'rotate-0'
              }`}
              src="assets/icons/arrow-gray.svg"
              alt="arrow"
            />
          </IconButton>
        </div>
      )}
    </CardItem>
  );
}

export default TxItem;
