import { envConfig } from 'app/configs/envConfig';
import axios from 'axios';

export const fetchAddress = async (addressId) => {
  const token = window.localStorage.getItem('jwt_access_token');
  const [qliAddressResponse, archStatusResponse, archBalanceResponse] = await Promise.all([
    axios.get(`${envConfig.QLI_API_URL}/Network/Id/${addressId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
    axios.get(`${envConfig.ARCHIVER_API_URL}/status`),
    axios.get(`${envConfig.ARCHIVER_API_URL}/balances/${addressId}`),
  ]);

  return {
    reportedValues: qliAddressResponse.data?.reportedValues,
    endTick: archStatusResponse.data?.lastProcessedTick?.tickNumber,
    balance: archBalanceResponse.data?.balance,
  };
};

export const fetchTransferTxs = async (
  addressId,
  initialStartTick,
  initialEndTick,
  batchSize,
  tickSize
) => {
  let data = [];
  let lastStartTick = initialStartTick;
  let lastEndTick = initialEndTick;

  const getTransfers = async (start, end) => {
    const url = `${envConfig.ARCHIVER_API_URL}/identities/${addressId}/transfer-transactions?startTick=${start}&endTick=${end}`;
    const response = await axios.get(url);
    return (
      response.data?.transferTransactionsPerTick.flatMap(({ transactions }) => transactions) || []
    );
  };

  const fetchRecursive = async (start, end) => {
    const transfers = await getTransfers(start, end);
    data = data.concat(transfers);

    if (start === 0 && transfers.length === 0) {
      return { data, lastStartTick, lastEndTick };
    }

    if (data.length < batchSize) {
      lastEndTick = Math.max(0, start - 1);
      lastStartTick = Math.max(0, lastEndTick - tickSize);

      return fetchRecursive(lastStartTick, lastEndTick);
    }
    return { data: data.sort((a, b) => b.tickNumber - a.tickNumber), lastStartTick, lastEndTick };
  };

  const finalResult = await fetchRecursive(initialStartTick, initialEndTick);

  return finalResult;
};

// TODO: This is a draft impl since backend need to impl pagination
export const fetchHistoricalTxs = async (addressId, offset) => {
  const token = window.localStorage.getItem('jwt_access_token');

  const response = await axios.get(
    `${envConfig.QLI_API_URL}/Network/Id/${addressId}?offset=${offset}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.data.latestTransfers;

  return data;
};
