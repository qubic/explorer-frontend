import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { ChevronDownIcon, Infocon } from '@app/assets/icons'
import { InfiniteScroll } from '@app/components/ui'
import { Button } from '@app/components/ui/buttons'
import { DotsLoader } from '@app/components/ui/loaders'
import { useTransactionExpandCollapse } from '@app/hooks'
import type { Transaction } from '@app/store/apis/archiver-v2'
import { TxItem } from '../../../components'

type Props = {
  addressId: string
  transactions: Transaction[]
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

  // Use shared expand/collapse hook
  const { expandAll, expandedTxIds, handleExpandAllChange, handleTxToggle } =
    useTransactionExpandCollapse({
      transactions,
      resetDependency: addressId
    })

  const renderTxItem = useCallback(
    ({ transaction, moneyFlew }: Transaction) => (
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
          <Infocon className="h-16 w-16 shrink-0 text-muted-foreground" />
          <p className="text-left text-14 text-muted-foreground">{t('historicalDataWarning')}</p>
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
          <p className="py-32 text-center text-14 text-muted-foreground">
            {transactions.length === 0 ? t('noTransactions') : t('allTransactionsLoaded')}
          </p>
        }
        renderItem={renderTxItem}
      />
    </div>
  )
}
