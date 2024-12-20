export interface Entity {
  identity: string
  balance: string
}

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

export interface GetAddressBalancesResponse {
  balance: {
    id: string
    balance: string
    validForTick: number
    latestIncomingTransferTick: number
    latestOutgoingTransferTick: number
    incomingAmount: string
    outgoingAmount: string
    numberOfIncomingTransfers: number
    numberOfOutgoingTransfers: number
  }
}

export interface IssuedAsset {
  issuerIdentity: string
  type: number
  name: string
  numberOfDecimalPlaces: number
  unitOfMeasurement: number[]
}

export interface OwnedAsset {
  ownerIdentity: string
  type: number
  padding: number
  managingContractIndex: number
  issuanceIndex: number
  numberOfUnits: string
  issuedAsset: IssuedAsset
}

export interface PossessedAsset {
  possessorIdentity: string
  type: number
  padding: number
  managingContractIndex: number
  issuanceIndex: number
  numberOfUnits: string
  ownedAsset: OwnedAsset
}

export interface AssetInfo {
  tick: number
  universeIndex: number
}

export interface GetIssuedAssetsResponse {
  issuedAssets: Array<{
    data: IssuedAsset
    info: AssetInfo
  }>
}

export interface GetOwnedAssetsResponse {
  ownedAssets: Array<{
    data: OwnedAsset
    info: AssetInfo
  }>
}

export interface GetPossessedAssetsResponse {
  possessedAssets: Array<{
    data: PossessedAsset
    info: AssetInfo
  }>
}

export interface TickData {
  computorIndex: number
  epoch: number
  tickNumber: number
  timestamp: string
  varStruct: string
  timeLock: string
  transactionIds: string[]
  contractFees: []
  signatureHex: string
}

export interface GetTickDataResponse {
  tickData: TickData
}
