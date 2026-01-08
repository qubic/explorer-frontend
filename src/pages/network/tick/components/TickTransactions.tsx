import { memo, useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ChevronDownIcon } from '@app/assets/icons'
import { InfiniteScroll, Skeleton } from '@app/components/ui'
import { Button } from '@app/components/ui/buttons'
import { useTransactionExpandCollapse } from '@app/hooks'
import type { QueryServiceTransaction } from '@app/store/apis/query-service'
import { useGetTransactionsForTickQuery } from '@app/store/apis/query-service'
import { formatRTKError } from '@app/utils/rtk'
import { TxItem } from '../../components'

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

  const {
    data: transactions,
    isFetching: isTickTransactionsLoading,
    error: tickTransactionsError
  } = useGetTransactionsForTickQuery(tick, { skip: !tick })

  // Use shared expand/collapse hook with custom ID extractor
  const { expandAll, expandedTxIds, handleExpandAllChange, handleTxToggle } =
    useTransactionExpandCollapse({
      transactions: displayTransactions,
      getTransactionId: (tx: QueryServiceTransaction) => tx.hash,
      resetDependency: tick
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

  return (
    <div className="flex flex-col gap-16">
      <p className="font-space text-xl font-500">{t('transactions')}</p>

      {displayTransactions.length > 0 && (
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
        items={displayTransactions}
        loadMore={loadMoreTransactions}
        hasMore={hasMore}
        isLoading={isTickTransactionsLoading}
        loader={<TickTransactionsSkeleton />}
        error={tickTransactionsError && formatRTKError(tickTransactionsError)}
        replaceContentOnLoading
        replaceContentOnError
        endMessage={
          <p className="py-32 text-center text-sm text-gray-50">
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
