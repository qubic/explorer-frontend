import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ChevronDownIcon, Infocon } from '@app/assets/icons'
import { InfiniteScroll } from '@app/components/ui'
import { Button } from '@app/components/ui/buttons'
import { DotsLoader } from '@app/components/ui/loaders'
import type { TransactionWithType } from '@app/types'
import { TxItem } from '../../../components'

type Props = {
  addressId: string
  transactions: TransactionWithType[]
  loadMore: () => Promise<void>
  hasMore: boolean
  isLoading: boolean
  error: string | null
}

export default function HistoricalTxs({
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
    // Update expandAll state based on whether all transactions are expanded
    setExpandAll((prevExpandAll) => {
      if (!isOpen && prevExpandAll) {
        return false
      }
      return prevExpandAll
    })
  }, [])

  const renderTxItem = useCallback(
    ({ transaction, moneyFlew }: TransactionWithType) => (
      <TxItem
        key={transaction.txId}
        tx={transaction}
        identity={addressId}
        variant="primary"
        isHistoricalTx
        nonExecutedTxIds={moneyFlew ? [] : [transaction?.txId]}
        isExpanded={expandedTxIds.has(transaction.txId)}
        onToggle={handleTxToggle}
      />
    ),
    [addressId, expandedTxIds, handleTxToggle]
  )

  return (
    <div className="flex w-full flex-col gap-10">
      {(!isLoading || transactions.length > 0) && (
        <div className="flex items-start gap-4 pb-14 md:items-center">
          <Infocon className="h-16 w-16 shrink-0 text-gray-50" />
          <p className="text-left text-14 text-gray-50">{t('historicalDataWarning')}</p>
        </div>
      )}

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
          <p className="py-32 text-center text-14 text-gray-50">
            {transactions.length === 0 ? t('noTransactions') : t('allTransactionsLoaded')}
          </p>
        }
        renderItem={renderTxItem}
      />
    </div>
  )
}
