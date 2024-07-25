const Routes = {
  NETWORK: {
    ROOT: '/network',
    ADDRESS: (address: string) => `${Routes.NETWORK.ROOT}/address/${address}`,
    TX: (txId: string) => `${Routes.NETWORK.ROOT}/tx/${txId}`,
    TICK: (tick: string | number) => `${Routes.NETWORK.ROOT}/tick/${tick}`
  },
  NOT_FOUND: '/404'
} as const

export default Routes
