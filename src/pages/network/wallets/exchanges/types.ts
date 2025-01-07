import type { ExchangeWallet } from '@app/types'

export type ExchangeWalletWithBalance = ExchangeWallet & {
  balance: number
}
