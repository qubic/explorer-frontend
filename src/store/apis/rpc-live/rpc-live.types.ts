export interface AssetInfo {
  tick: number
  universeIndex: number
}

export interface AssetIssuance {
  data: IssuedAsset
  tick: number
  universeIndex: number
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

// Response types
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

export interface GetAssetsIssuancesResponse {
  assets: AssetIssuance[]
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

export interface GetTickInfoResponse {
  tickInfo: {
    tick: number
    duration: number
    epoch: number
    initialTick: number
  }
}
