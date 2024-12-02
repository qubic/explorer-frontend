import type { Entity } from '@app/services/archiver'

export interface PaginationInfo {
  totalRecords: number
  currentPage: number
  totalPages: number
}

export interface GetEpochComputorsResponse {
  computors: {
    epoch: number
    identities: string[]
    signatureHex: string
  }
}

export interface GetLatestStatsResponse {
  data: {
    timestamp: string
    circulatingSupply: string
    activeAddresses: number
    price: number
    marketCap: string
    epoch: number
    currentTick: number
    ticksInCurrentEpoch: number
    emptyTicksInCurrentEpoch: number
    epochTickQuality: number
    burnedQus: string
  }
}

export interface GetRichListResponse {
  pagination: PaginationInfo
  epoch: number
  richList: {
    entities: Entity[]
  }
}
