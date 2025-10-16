export const EXPLORER_NETWORK_URLS = {
  MAINNET: { networkId: 'mainnet', label: 'Mainnet', url: 'https://explorer.qubic.org' },
  TESTNET: { networkId: 'testnet', label: 'Testnet', url: 'https://testnet.explorer.qubic.org' }
} as const

// Note: All smart contracts, tokens, exchanges, and address labels data are now fetched from static API
// Use the following hooks to get the data:
// - useGetSmartContractsQuery() from '@app/store/apis/qubic-static'
// - useGetTokensQuery() from '@app/store/apis/qubic-static'
// - useGetExchangesQuery() from '@app/store/apis/qubic-static'
// - useGetAddressLabelsQuery() from '@app/store/apis/qubic-static'
