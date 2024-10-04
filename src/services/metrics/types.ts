export interface QubicStats {
  date: string
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

export interface GithubStatsOverview {
  commits: number
  contributors: number
  openIssues: number
  closedIssues: number
  branches: number
  releases: number
  starsCount: number
  watchersCount: number
}
