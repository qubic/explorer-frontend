export interface SmartContractRewardDistribution {
  totalAmount: string
  transferCount: number
  amountPerShare: number
  tickNumber: number
  timestamp: string
  epoch: number
}

export interface GetSmartContractRewardsRequest {
  smartContractAddress: string
  pagination?: {
    offset?: number
    size?: number
  }
}

export interface RawGetSmartContractRewardsResponse {
  hits: {
    total: number
    from: number
    size: number
  }
  smartContractAddress: string
  totalAllTimeDistributed: string
  distributions: SmartContractRewardDistribution[]
  validForTick?: number
}

export interface SmartContractRewards {
  total: number
  smartContractAddress: string
  totalAllTimeDistributed: string
  distributions: SmartContractRewardDistribution[]
  validForTick?: number
}
