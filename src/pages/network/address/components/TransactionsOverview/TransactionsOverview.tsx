import { memo } from 'react'

import { useLatestTransactions } from '../../hooks'
import LatestTransactions from './LatestTransactions'

type Props = {
  addressId: string
}

function TransactionsOverview({ addressId }: Props) {
  const {
    transactions,
    totalCount,
    loadMoreTransactions,
    hasMore,
    isLoading,
    error,
    applyFilters,
    clearFilters,
    activeFilters
  } = useLatestTransactions(addressId)

  return (
    <div className="rounded-lg border border-primary-60 px-16 py-20">
      <LatestTransactions
        addressId={addressId}
        transactions={transactions}
        totalCount={totalCount}
        loadMore={loadMoreTransactions}
        hasMore={hasMore}
        isLoading={isLoading}
        error={error}
        onApplyFilters={applyFilters}
        onClearFilters={clearFilters}
        activeFilters={activeFilters}
      />
    </div>
  )
}

const MemoizedTransactionsOverview = memo(TransactionsOverview)
export default MemoizedTransactionsOverview
