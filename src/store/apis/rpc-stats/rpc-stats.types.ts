export interface Entity {
  identity: string
  balance: string
}

export interface Owner {
  identity: string
  numberOfShares: string
}

export interface PaginationInfo {
  totalRecords: number
  currentPage: number
  totalPages: number
  pageSize: number
}

// Response types
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

export interface GetAssetsRichListResponse {
  pagination: PaginationInfo
  tick: number
  owners: Owner[]
}
