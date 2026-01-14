import type { TxEra } from '@app/types'

function buildUrlWithQueryParams<T extends Record<string, string | undefined>>(
  path: string,
  queryParams?: T
): string {
  if (!queryParams) return path

  const params = new URLSearchParams()
  Object.entries(queryParams).forEach(([key, value]) => {
    if (value !== undefined) {
      params.append(key, value)
    }
  })

  const queryString = params.toString()
  return queryString ? `${path}?${queryString}` : path
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
      RICH_LIST: (issuer?: string, asset?: string) =>
        buildUrlWithQueryParams(`${Routes.NETWORK.ROOT}/assets/rich-list`, { issuer, asset })
    }
  },
  NOT_FOUND: '/404'
} as const

export default Routes
