import { envConfig } from 'app/configs/envConfig';
import axios from 'axios';

export const fetchTransferTxWithStatus = async (txId) => {
  const [infoResponse, statusResponse] = await Promise.all([
    axios.get(`${envConfig.ARCHIVER_API_URL}/transactions/${txId}`).catch(() => null),
    axios.get(`${envConfig.ARCHIVER_API_URL}/tx-status/${txId}`).catch(() => null),
  ]);

  const txInfo = infoResponse ? infoResponse.data.transaction : null;
  const txStatus = statusResponse ? statusResponse.data.transactionStatus : null;

  return { tx: txInfo, status: txStatus };
};

export const fetchHistoricalTx = async (txId) => {
  const token = window.localStorage.getItem('jwt_access_token');

  const { data } = await axios.get(`${envConfig.QLI_API_URL}/Network/tx/${txId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
};
