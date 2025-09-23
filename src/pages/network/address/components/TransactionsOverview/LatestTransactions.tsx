import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { InfiniteScroll } from '@app/components/ui'
import { DotsLoader } from '@app/components/ui/loaders'
import type { QueryServiceTransaction } from '@app/store/apis/query-service/query-service.types'
import { TxItem } from '../../../components'

type Props = {
  addressId: string
  transactions: QueryServiceTransaction[]
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
      />
    ),
    [addressId]
  )

  return (
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
  )
}
