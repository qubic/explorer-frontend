import { QubicTransferSendManyPayload } from 'qubic-ts-library/dist/qubic-types/transacion-payloads/QubicTransferSendManyPayload';

const fetchEntries = async (data) => {
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

  return standardizedData;
};

const formatString = (string) => {
  return string ? Number(string).toLocaleString('en-US') : '0';
};

const formatDate = (dateString) => {
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    timeZoneName: 'short',
    hour12: true, // Use 12-hour format with AM/PM
  };

  if (dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', options).format(date);
  }
  return '';
};

function formatEllipsis(str) {
  if (str) {
    if (str.length > 10) {
      return `${str.substr(0, 5)}...${str.substr(-5)}`;
    }
    return str;
  }
  return '';
}

export { fetchEntries, formatString, formatDate, formatEllipsis };
