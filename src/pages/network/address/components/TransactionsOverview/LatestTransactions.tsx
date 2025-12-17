import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { ChevronDownIcon } from '@app/assets/icons'
import { InfiniteScroll } from '@app/components/ui'
import { Button } from '@app/components/ui/buttons'
import { DotsLoader } from '@app/components/ui/loaders'
import { useTransactionExpandCollapse } from '@app/hooks'
import type { QueryServiceTransaction } from '@app/store/apis/query-service/query-service.types'
import { TxItem } from '../../../components'
import type { TransactionFilters } from '../../hooks/useLatestTransactions'
import TransactionFiltersBar from './TransactionFiltersBar'

type Props = {
  addressId: string
  transactions: QueryServiceTransaction[]
  loadMore: () => Promise<void>
  hasMore: boolean
  isLoading: boolean
  error: string | null
  onApplyFilters: (filters: TransactionFilters) => void
  onClearFilters: () => void
  activeFilters: TransactionFilters
}

export default function LatestTransactions({
  addressId,
  transactions,
  loadMore,
  hasMore,
  isLoading,
  error,
  onApplyFilters,
  onClearFilters,
  activeFilters
}: Props) {
  const { t } = useTranslation('network-page')

  // Use shared expand/collapse hook with custom ID extractor for QueryServiceTransaction
  const { expandAll, expandedTxIds, handleExpandAllChange, handleTxToggle } =
    useTransactionExpandCollapse({
      transactions,
      getTransactionId: (tx) => tx.hash,
      resetDependency: addressId
    })

  const renderTxItem = useCallback(
    (tx: QueryServiceTransaction) => (
      <TxItem
        key={tx.hash}
        tx={{
          txId: tx.hash,
          sourceId: tx.source,
          destId: tx.destination,
          amount: tx.amount,
          tickNumber: tx.tickNumber,
          inputType: tx.inputType,
          inputHex: tx.inputData
        }}
        identity={addressId}
        variant="primary"
        nonExecutedTxIds={tx.moneyFlew ? [] : [tx.hash]}
        timestamp={tx.timestamp}
        isExpanded={expandedTxIds.has(tx.hash)}
        onToggle={handleTxToggle}
      />
    ),
    [addressId, expandedTxIds, handleTxToggle]
  )

  return (
    <div className="flex w-full flex-col gap-10">
      <TransactionFiltersBar
        activeFilters={activeFilters}
        onApplyFilters={onApplyFilters}
        onClearFilters={onClearFilters}
      />

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
