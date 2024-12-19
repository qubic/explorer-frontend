import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { Infocon } from '@app/assets/icons'
import { InfiniteScroll } from '@app/components/ui'
import { DotsLoader } from '@app/components/ui/loaders'
import type { TransactionWithStatus } from '@app/types'
import { TxItem } from '../../../components'

type Props = {
  addressId: string
  transactions: TransactionWithStatus[]
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

  const renderTxItem = useCallback(
    ({ tx, status }: TransactionWithStatus) => (
      <TxItem
        key={tx.txId}
        tx={tx}
        identity={addressId}
        variant="primary"
        isHistoricalTx
        nonExecutedTxIds={status?.moneyFlew ? [] : [status?.txId]}
      />
    ),
    [addressId]
  )

  return (
    <div className="grid w-full gap-10">
      {(!isLoading || transactions.length > 0) && (
        <div className="flex items-start gap-4 pb-14 md:items-center">
          <Infocon className="h-16 w-16 shrink-0 text-gray-50" />
          <p className="text-left text-14 text-gray-50">{t('historicalDataWarning')}</p>
        </div>
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
