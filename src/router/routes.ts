import type { TxEra } from '@app/types'

function buildUrlWithQueryParams<T extends Record<string, string>>(
  path: string,
  queryParams?: T
): string {
  if (!queryParams) return path
  const queryString = new URLSearchParams(queryParams).toString()

  return `${path}?${queryString}`
}

export type NetworkTxQueryParams = {
  type?: TxEra
}

export const Routes = {
  NETWORK: {
    ROOT: '/network',
    ADDRESS: (address: string) => `${Routes.NETWORK.ROOT}/address/${address}`,
    TX: (txId: string, query: NetworkTxQueryParams = { type: 'latest' }) =>
      buildUrlWithQueryParams(`${Routes.NETWORK.ROOT}/tx/${txId}`, query),
    TICK: (tick: string | number) => `${Routes.NETWORK.ROOT}/tick/${tick}`,
    WALLETS: {
      RICH_LIST: '/network/wallets/rich-list',
      EXCHANGES: '/network/wallets/exchanges'
    },
    ASSETS: {
      TOKENS: '/network/assets/tokens',
      SMART_CONTRACTS: '/network/assets/smart-contracts',
      RICH_LIST: '/network/assets/rich-list'
    },
    DEVELOPERS: {
      HACKATHON: '/network/developers/hackathon'
    }
  },
  NOT_FOUND: '/404'
} as const

export default Routes
