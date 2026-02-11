import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { ChevronDownIcon, Infocon } from '@app/assets/icons'
import { InfiniteScroll, Tooltip } from '@app/components/ui'
import { Button } from '@app/components/ui/buttons'
import { DotsLoader } from '@app/components/ui/loaders'
import { useTransactionExpandCollapse } from '@app/hooks'
import type { QueryServiceTransaction } from '@app/store/apis/query-service'
import { TxItem } from '../../../components'
import { MAX_TRANSACTION_RESULTS, type TransactionFilters } from '../../hooks/useLatestTransactions'
import { parseFilterApiError } from './filterUtils'
import TransactionFiltersBar from './TransactionFiltersBar'

type Props = {
  addressId: string
  transactions: QueryServiceTransaction[]
  totalCount: number | null
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
  totalCount,
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
        tx={tx}
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

  // Parse API error to show localized message
  // The server returns only a partial address in error messages, so we display it as-is
  const errorMessage = useMemo(() => {
    if (!error) return null
    const parsed = parseFilterApiError(error)
    if (parsed) {
      return t(parsed.messageKey, { address: parsed.address || '' })
    }
    return t('loadingTransactionsError')
  }, [error, t])

  return (
    <div className="flex w-full flex-col gap-10">
      <TransactionFiltersBar
        addressId={addressId}
        activeFilters={activeFilters}
        onApplyFilters={onApplyFilters}
        onClearFilters={onClearFilters}
      />

      {(totalCount !== null || transactions.length > 0) && (
        <div className="flex flex-wrap items-center justify-between gap-8">
          {totalCount !== null && totalCount > 0 ? (
            <div className="flex items-center text-sm text-gray-50">
              {totalCount >= MAX_TRANSACTION_RESULTS ? (
                <>
                  <span>
                    {t('showingMaxTransactions', {
                      count: MAX_TRANSACTION_RESULTS.toLocaleString()
                    } as Record<string, string>)}
                  </span>
                  <Tooltip
                    tooltipId="max-results-info"
                    content={t('maxResultsHint', {
                      count: MAX_TRANSACTION_RESULTS.toLocaleString()
                    } as Record<string, string>)}
                  >
                    <Infocon className="ml-6 h-16 w-16 cursor-help text-gray-50" />
                  </Tooltip>
                </>
              ) : (
                <span>
                  {t('transactionsFound', { count: totalCount.toLocaleString() } as Record<
                    string,
                    string
                  >)}
                </span>
              )}
            </div>
          ) : null}

          {transactions.length > 0 && (
            <Button
              variant="link"
              size="sm"
              onClick={() => handleExpandAllChange(!expandAll)}
              className="w-fit gap-6"
            >
              <ChevronDownIcon
                className={`h-16 w-16 transition-transform duration-300 ${expandAll ? 'rotate-180' : 'rotate-0'}`}
              />
              {expandAll ? t('collapseAll') : t('expandAll')}
            </Button>
          )}
        </div>
      )}

      <InfiniteScroll
        items={transactions}
        loadMore={loadMore}
        hasMore={hasMore}
        isLoading={isLoading}
        loader={<DotsLoader showLoadingText />}
        error={errorMessage}
        endMessage={
          <p className="py-32 text-center text-sm text-muted-foreground">
            {transactions.length === 0 ? t('noTransactions') : t('allTransactionsLoaded')}
          </p>
        }
        renderItem={renderTxItem}
      />
    </div>
  )
}
