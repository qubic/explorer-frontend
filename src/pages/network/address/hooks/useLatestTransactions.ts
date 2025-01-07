import { useCallback, useEffect, useRef, useState } from 'react'

import type { GetAddressBalancesResponse } from '@app/store/apis/archiver-v1'
import type { Transaction } from '@app/store/apis/archiver-v2'
import { useLazyGetIndentityTransfersQuery } from '@app/store/apis/archiver-v2'

const BATCH_SIZE = 50
const TICK_SIZE = 200_000

export interface UseLatestTransactionsResult {
  transactions: Transaction[]
  loadMoreTransactions: () => Promise<void>
  hasMore: boolean
  isLoading: boolean
  error: string | null
}

export default function useLatestTransactions(
  addressId: string,
  addressEndTick: GetAddressBalancesResponse['balance']['validForTick']
): UseLatestTransactionsResult {
  const [startTick, setStartTick] = useState(Math.max(0, addressEndTick - TICK_SIZE))
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [txsList, setTxsList] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const cancellationRef = useRef(false)

  const [getIdentityTransfersQuery, { isFetching, error }] = useLazyGetIndentityTransfersQuery({})

  const hasMore = startTick > 0

  const fetchTransfers = useCallback(
    async (start: number, end: number) => {
      const result = await getIdentityTransfersQuery({
        addressId,
        startTick: start,
        endTick: end
      }).unwrap()

      return result || []
    },
    [getIdentityTransfersQuery, addressId]
  )

  const fetchRecursive = useCallback(
    async (start: number, end: number, accumulatedData: Transaction[] = []) => {
      if (cancellationRef.current) return { newTxs: accumulatedData, lastStartTick: start }

      const newTxs = await fetchTransfers(start, end)
      const combinedData = [...new Set(accumulatedData.concat(newTxs))]

      if (combinedData.length < BATCH_SIZE && start > 0) {
        const newEndTick = Math.max(0, start - 1)
        const newStartTick = Math.max(0, start - 1 - TICK_SIZE)
        return fetchRecursive(newStartTick, newEndTick, combinedData)
      }

      return {
        newTxs: combinedData.sort((a, b) => b.transaction.tickNumber - a.transaction.tickNumber),
        lastStartTick: start
      }
    },
    [fetchTransfers]
  )

  const loadMoreTransactions = useCallback(async () => {
    if (isLoading || isFetching || !hasMore) return

    setIsLoading(true)
    try {
      if (txsList.length < BATCH_SIZE) {
        const newStartTick = Math.max(0, startTick - 1 - TICK_SIZE)
        const newEndTick = Math.max(0, startTick - 1)
        const { newTxs, lastStartTick } = await fetchRecursive(newStartTick, newEndTick)
        // Since there could be some txs in txsList already, we need to merge them and then slice it
        const updatedTxList = [...txsList, ...newTxs]
        // Adding the new transactions to the list to be displayed
        setTransactions((prev) => [...prev, ...updatedTxList.slice(0, BATCH_SIZE)])
        // Updating the list of remaining transactions
        setTxsList(updatedTxList.slice(BATCH_SIZE, updatedTxList.length))
        // Updating the start and end tick
        setStartTick(lastStartTick)
      } else {
        setTransactions((prev) => [...prev, ...txsList.slice(0, BATCH_SIZE)])
        setTxsList((prevTxsList) => prevTxsList.slice(BATCH_SIZE, prevTxsList.length))
      }
    } finally {
      setIsLoading(false)
    }
  }, [startTick, fetchRecursive, isLoading, isFetching, hasMore, txsList])

  useEffect(() => {
    let isMounted = true
    cancellationRef.current = false

    const initialFetch = async () => {
      setIsLoading(true)
      const initialStartTick = Math.max(0, addressEndTick - TICK_SIZE)
      const { newTxs, lastStartTick } = await fetchRecursive(initialStartTick, addressEndTick)

      if (isMounted) {
        setTransactions(newTxs.slice(0, BATCH_SIZE))
        setTxsList(newTxs.slice(BATCH_SIZE, newTxs.length))
        setStartTick(lastStartTick)
        setIsLoading(false)
      }
    }

    if (transactions.length === 0 && addressEndTick) {
      initialFetch()
    }

    return () => {
      isMounted = false
      cancellationRef.current = true
    }
  }, [fetchRecursive, transactions.length, addressEndTick])

  useEffect(() => {
    return () => {
      if (addressId) {
        setTransactions([])
        setTxsList([])
        setStartTick(0)
      }
    }
  }, [addressId])

  return {
    transactions,
    loadMoreTransactions,
    hasMore,
    isLoading,
    error: error ? String(error) : null
  }
}
