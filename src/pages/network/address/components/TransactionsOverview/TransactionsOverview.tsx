import { memo } from 'react'

import LatestTransactions from './LatestTransactions'

type Props = {
  addressId: string
}

function TransactionsOverview({ addressId }: Props) {
  return <LatestTransactions addressId={addressId} />
}

const MemoizedTransactionsOverview = memo(TransactionsOverview)
export default MemoizedTransactionsOverview
