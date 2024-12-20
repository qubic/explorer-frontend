export interface User {
  id: string
  name: string
  avatar: string | null
  status: string
  privileges: string[]
  is2FAEnabled: boolean
}

export interface GetUserResponse {
  success: boolean
  token: string
  refreshToken: string
  user: User
}

export interface GetAddressHistoryQueryParams {
  addressId: string
  page: number
  pageSize: number
}

export interface HistoricalTx {
  id: string
  executed: boolean
  tick: number
  includedByTickLeader: boolean
  sourceId: string
  destId: string
  amount: number
  type: number
  digest: string
  moneyFlew: boolean
  data: string
}
