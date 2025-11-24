import { useCallback, useEffect, useState } from 'react'

import { useLazyGetAddressBalancesQuery } from '@app/store/apis/archiver-v1'
import { useGetExchangesQuery } from '@app/store/apis/qubic-static'
import type { ExchangeWallet } from '@app/types'
import type { ExchangeWalletWithBalance } from '../types'

type UseGetExchangesBalancesOutput = {
  exchangeWallets: ExchangeWalletWithBalance[]
  isLoading: boolean
  error: unknown
}

export default function useGetExchangesBalances(): UseGetExchangesBalancesOutput {
  const [exchangeWallets, setExchangeWallets] = useState<ExchangeWalletWithBalance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  const {
    data: exchanges,
    isLoading: isLoadingExchanges,
    error: exchangesError
  } = useGetExchangesQuery()
  const [triggerQuery] = useLazyGetAddressBalancesQuery()

  const getAddressBalance = useCallback(
    async ({ name, address }: ExchangeWallet) => {
      const { balance } = await triggerQuery({ address }).unwrap()

      return {
        name,
        address,
        balance: error ? 0 : Number(balance) || 0
      }
    },
    [error, triggerQuery]
  )

  useEffect(() => {
    const fetchBalances = async () => {
      if (!exchanges || isLoadingExchanges) {
        setIsLoading(true)
        return
      }

      if (exchangesError) {
        setError(true)
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(false)

      try {
        const results = await Promise.all(exchanges.map((exchange) => getAddressBalance(exchange)))

        setExchangeWallets(results.toSorted((a, b) => b.balance - a.balance))
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err)
        setError(true)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBalances()
  }, [error, exchanges, exchangesError, getAddressBalance, isLoadingExchanges, triggerQuery])

  return { exchangeWallets, isLoading, error }
}
