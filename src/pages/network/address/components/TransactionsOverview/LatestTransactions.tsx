import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ChevronDownIcon } from '@app/assets/icons'
import { InfiniteScroll } from '@app/components/ui'
import { Button } from '@app/components/ui/buttons'
import { DotsLoader } from '@app/components/ui/loaders'
import type { Transaction } from '@app/store/apis/archiver-v2'
import { TxItem } from '../../../components'

type Props = {
  addressId: string
  transactions: Transaction[]
  loadMore: () => Promise<void>
  hasMore: boolean
  isLoading: boolean
  error: string | null
}

export default function LatestTransactions({
  addressId,
  transactions,
  loadMore,
  hasMore,
  isLoading,
  error
}: Props) {
  const { t } = useTranslation('network-page')
  const [expandAll, setExpandAll] = useState(false)
  const [expandedTxIds, setExpandedTxIds] = useState<Set<string>>(new Set())

  // Reset expand state when addressId changes
  useEffect(() => {
    setExpandAll(false)
    setExpandedTxIds(new Set())
  }, [addressId])

  // Auto-expand newly loaded transactions when expandAll is active
  useEffect(() => {
    if (expandAll && transactions.length > 0) {
      setExpandedTxIds((prev) => {
        const newSet = new Set(prev)
        transactions.forEach((tx) => newSet.add(tx.transaction.txId))
        return newSet
      })
    }
  }, [transactions, expandAll])

  const handleExpandAllChange = useCallback(
    (checked: boolean) => {
      setExpandAll(checked)
      if (checked) {
        // Expand all displayed transactions
        const allTxIds = new Set(transactions.map((tx) => tx.transaction.txId))
        setExpandedTxIds(allTxIds)
      } else {
        // Collapse all
        setExpandedTxIds(new Set())
      }
    },
    [transactions]
  )

  const handleTxToggle = useCallback((txId: string, isOpen: boolean) => {
    setExpandedTxIds((prev) => {
      const newSet = new Set(prev)
      if (isOpen) {
        newSet.add(txId)
      } else {
        newSet.delete(txId)
      }
      return newSet
    })
  }, [])

  const renderTxItem = useCallback(
    ({ transaction, moneyFlew, timestamp }: Transaction) => (
      <TxItem
        key={transaction.txId}
        tx={transaction}
        identity={addressId}
        variant="primary"
        nonExecutedTxIds={moneyFlew ? [] : [transaction.txId]}
        timestamp={timestamp}
        isExpanded={expandedTxIds.has(transaction.txId)}
        onToggle={handleTxToggle}
      />
    ),
    [addressId, expandedTxIds, handleTxToggle]
  )

  return (
    <div className="flex w-full flex-col gap-10">
      {transactions.length > 0 && (
        <Button
          variant="link"
          size="sm"
          onClick={() => handleExpandAllChange(!expandAll)}
          className="ml-auto w-fit gap-6 pb-8"
        >
          <ChevronDownIcon
            className={`h-16 w-16 transition-transform duration-300 ${expandAll ? 'rotate-180' : 'rotate-0'}`}
          />
          {expandAll ? t('collapseAll') : t('expandAll')}
        </Button>
      )}

      <InfiniteScroll
        items={transactions}
        loadMore={loadMore}
        hasMore={hasMore}
        isLoading={isLoading}
        loader={<DotsLoader showLoadingText />}
        error={error && t('loadingTransactionsError')}
        endMessage={
          <p className="py-32 text-center text-sm text-gray-50">
            {transactions.length === 0 ? t('noTransactions') : t('allTransactionsLoaded')}
          </p>
        }
        renderItem={renderTxItem}
      />
    </div>
  )
}
