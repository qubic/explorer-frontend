import envConfig from '@app/configs/envConfig'

const BASE_URL = envConfig.ARCHIVER_API_URL

const formatTick = (tick: string) => parseInt(tick.replace(/,/g, ''), 10)

const makeTicksUrl = (tick: string) => `${BASE_URL}/ticks/${formatTick(tick)}`

export const ARCHIVER_API_ENDPOINTS = {
  // BALANCES
  BALANCES: (addressId: string) => `${BASE_URL}/balances/${addressId}`,
  // TRANSACTIONS
  TRANSACTIONS: (txId: string) => `${BASE_URL}/transactions/${txId}`,
  TRANSACTION_STATUS: (txId: string) => `${BASE_URL}/tx-status/${txId}`,
  // TICKS
  TICK_DATA: (tick: string) => `${makeTicksUrl(tick)}/tick-data`,
  TICK_TRANSACTIONS: (tick: string) => `${makeTicksUrl(tick)}/transactions`,
  TICK_TRANSFER_TRANSACTIONS: (tick: string) => `${makeTicksUrl(tick)}/transfer-transactions`,
  TICK_APPROVED_TRANSACTIONS: (tick: string) => `${makeTicksUrl(tick)}/approved-transactions`,
  // EPOCHS
  EPOCH_COMPUTORS: (epoch: number) => `${BASE_URL}/epochs/${epoch}/computors`
} as const

export default ARCHIVER_API_ENDPOINTS
