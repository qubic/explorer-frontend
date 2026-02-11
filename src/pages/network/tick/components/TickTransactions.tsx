import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ChevronDownIcon } from '@app/assets/icons'
import { InfiniteScroll, Skeleton } from '@app/components/ui'
import { Button } from '@app/components/ui/buttons'
import { useTransactionExpandCollapse } from '@app/hooks'
import type { QueryServiceTransaction } from '@app/store/apis/query-service'
import { useGetTransactionsForTickQuery } from '@app/store/apis/query-service'
import { TxItem } from '../../components'
import TickTransactionFiltersBar from './TickTransactionFiltersBar'
import type { TickTransactionFilters } from './tickFilterUtils'
import {
  buildTickTransactionsRequest,
  extractErrorMessage,
  parseFilterApiError
} from './tickFilterUtils'

const PAGE_SIZE = 10

const TickTransactionsSkeleton = memo(() => (
  <div className="grid gap-12">
    {Array.from({ length: PAGE_SIZE / 2 }).map((_, index) => (
      <Skeleton key={String(`${index}`)} className="h-[78px] sm:h-52" />
    ))}
  </div>
))

type Props = Readonly<{
  tick: number
}>

export default function TickTransactions({ tick }: Props) {
  const { t } = useTranslation('network-page')
  const [displayTransactions, setDisplayTransactions] = useState<QueryServiceTransaction[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [activeFilters, setActiveFilters] = useState<TickTransactionFilters>({})

  // Build the API request with filters
  const request = useMemo(
    () => buildTickTransactionsRequest(tick, activeFilters),
    [tick, activeFilters]
  )

  const {
    data: transactions,
    isFetching: isTickTransactionsLoading,
    error: tickTransactionsError
  } = useGetTransactionsForTickQuery(request, { skip: !tick })

  // Extract error message from RTK Query error
  const errorMessage = useMemo(() => {
    if (!tickTransactionsError) return null
    const errorStr = extractErrorMessage(tickTransactionsError)
    const parsed = parseFilterApiError(errorStr)
    if (parsed) {
      return t(parsed.messageKey, { address: parsed.address || '' })
    }
    return errorStr
  }, [tickTransactionsError, t])

  // Use shared expand/collapse hook with custom ID extractor
  const { expandAll, expandedTxIds, handleExpandAllChange, handleTxToggle } =
    useTransactionExpandCollapse({
      transactions: displayTransactions,
      getTransactionId: (tx: QueryServiceTransaction) => tx.hash,
      resetDependency: `${tick}-${JSON.stringify(activeFilters)}`
    })

  const loadMoreTransactions = useCallback(() => {
    if (transactions && displayTransactions.length < transactions.length) {
      const nextTransactions = transactions.slice(
        displayTransactions.length,
        displayTransactions.length + PAGE_SIZE
      )
      setDisplayTransactions((prevTransactions) => [...prevTransactions, ...nextTransactions])
      setHasMore(displayTransactions.length + PAGE_SIZE < transactions.length)
    } else {
      setHasMore(false)
    }
  }, [displayTransactions, transactions])

  useEffect(() => {
    if (transactions) {
      setDisplayTransactions(transactions.slice(0, PAGE_SIZE))
      setHasMore(transactions.length > PAGE_SIZE)
    }
  }, [transactions])

  const handleApplyFilters = useCallback((filters: TickTransactionFilters) => {
    setActiveFilters(filters)
  }, [])

  const handleClearFilters = useCallback(() => {
    setActiveFilters({})
  }, [])

  const totalCount = transactions?.length ?? null

  return (
    <div className="flex flex-col gap-16">
      <p className="font-space text-xl font-500">{t('transactions')}</p>

      <TickTransactionFiltersBar
        activeFilters={activeFilters}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
      />

      {(totalCount !== null || displayTransactions.length > 0) && (
        <div className="flex flex-wrap items-center justify-between gap-8">
          {totalCount !== null && totalCount > 0 ? (
            <span className="text-sm text-gray-50">
              {t('transactionsFound', {
                count: totalCount.toLocaleString()
              } as Record<string, string>)}
            </span>
          ) : null}

          {displayTransactions.length > 0 && (
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
        items={displayTransactions}
        loadMore={loadMoreTransactions}
        hasMore={hasMore}
        isLoading={isTickTransactionsLoading}
        loader={<TickTransactionsSkeleton />}
        error={errorMessage}
        replaceContentOnLoading
        replaceContentOnError
        endMessage={
          <p className="py-32 text-center text-sm text-muted-foreground">
            {displayTransactions.length === 0 ? t('noTransactions') : t('allTransactionsLoaded')}
          </p>
        }
        renderItem={(tx: QueryServiceTransaction) => (
          <TxItem
            key={tx.hash}
            tx={tx}
            nonExecutedTxIds={tx.moneyFlew ? [] : [tx.hash]}
            timestamp={tx.timestamp}
            isExpanded={expandedTxIds.has(tx.hash)}
            onToggle={handleTxToggle}
          />
        )}
      />
    </div>
  )
}
