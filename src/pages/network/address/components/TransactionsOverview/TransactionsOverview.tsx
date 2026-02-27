import { memo } from 'react'

import LatestTransactions from './LatestTransactions'

type Props = {
  addressId: string
}

function TransactionsOverview({ addressId }: Props) {
  return (
    <div className="rounded-lg border border-primary-60 px-16 py-20">
      <LatestTransactions addressId={addressId} />
    </div>
  )
}

const MemoizedTransactionsOverview = memo(TransactionsOverview)
export default MemoizedTransactionsOverview
