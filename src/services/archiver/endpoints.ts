import envConfig from '@app/configs/envConfig'

const BASE_URL = envConfig.ARCHIVER_API_URL

const formatTick = (tick: string) => parseInt(tick.replace(/,/g, ''), 10)

const makeTicksUrl = (tick: string) => `${BASE_URL}/ticks/${formatTick(tick)}`

const ARCHIVER_API_ENDPOINTS = {
  // BALANCES
  BALANCES: (query: string) => `${BASE_URL}/balances/${query}`,
  // TRANSACTIONS
  TRANSACTIONS: (query: string) => `${BASE_URL}/transactions/${query}`,
  // TICKS
  TICK_DATA: (query: string) => `${makeTicksUrl(query)}/tick-data`,
  TICK_TRANSACTIONS: (query: string) => `${makeTicksUrl(query)}/transactions`,
  TICK_TRANSFER_TRANSACTIONS: (query: string) => `${makeTicksUrl(query)}/transfer-transactions`,
  TICK_APPROVED_TRANSACTIONS: (query: string) => `${makeTicksUrl(query)}/approved-transactions`,
  // EPOCHS
  EPOCH_COMPUTORS: (epoch: number) => `${BASE_URL}/epochs/${epoch}/computors`
} as const

export default ARCHIVER_API_ENDPOINTS
