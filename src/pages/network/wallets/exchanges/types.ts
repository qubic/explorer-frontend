export type ExchangeWallet = {
  name: string
  address: string
}

export type ExchangeWalletWithBalance = ExchangeWallet & {
  balance: number
}
