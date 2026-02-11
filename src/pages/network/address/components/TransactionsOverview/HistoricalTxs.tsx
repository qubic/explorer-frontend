import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { ChevronDownIcon, Infocon } from '@app/assets/icons'
import { InfiniteScroll } from '@app/components/ui'
import { Button } from '@app/components/ui/buttons'
import { DotsLoader } from '@app/components/ui/loaders'
import { useTransactionExpandCollapse } from '@app/hooks'
import type { QueryServiceTransaction } from '@app/store/apis/query-service'
import { convertToQueryServiceTx } from '@app/store/apis/query-service/query-service.adapters'
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

  // Convert transactions to QueryServiceTransaction format
  const convertedTransactions = useMemo(
    () => transactions.map(convertToQueryServiceTx),
    [transactions]
  )

  // Use shared expand/collapse hook with custom ID extractor
  const { expandAll, expandedTxIds, handleExpandAllChange, handleTxToggle } =
    useTransactionExpandCollapse({
      transactions: convertedTransactions,
      getTransactionId: (tx: QueryServiceTransaction) => tx.hash,
      resetDependency: addressId
    })

  const renderTxItem = useCallback(
    (tx: QueryServiceTransaction) => (
      <TxItem
        key={tx.hash}
        tx={tx}
        identity={addressId}
        variant="primary"
        isHistoricalTx
        nonExecutedTxIds={tx.moneyFlew ? [] : [tx.hash]}
        isExpanded={expandedTxIds.has(tx.hash)}
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
        items={convertedTransactions}
        loadMore={loadMore}
        hasMore={hasMore}
        isLoading={isLoading}
        loader={<DotsLoader showLoadingText />}
        error={error && t('loadingTransactionsError')}
        endMessage={
          <p className="py-32 text-center text-14 text-muted-foreground">
            {convertedTransactions.length === 0 ? t('noTransactions') : t('allTransactionsLoaded')}
          </p>
        }
        renderItem={renderTxItem}
      />
    </div>
  )
}
