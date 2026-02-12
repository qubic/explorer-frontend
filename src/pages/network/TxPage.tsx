import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import { withHelmet } from '@app/components/hocs'
import { Breadcrumbs } from '@app/components/ui'
import { ErrorFallback } from '@app/components/ui/error-boundaries'
import { PageLayout } from '@app/components/ui/layouts'
import { LinearProgress } from '@app/components/ui/loaders'
import { useGetTransactionByHashQuery } from '@app/store/apis/query-service'
import { formatEllipsis } from '@app/utils'
import { HomeLink, TickLink, TxItem, WaitingForTick } from './components'
import TransactionEvents from './components/TxItem/TransactionEvents'
import { useTickWatcher, useTransactionEvents } from './hooks'

function TxPage() {
  const { t } = useTranslation('network-page')
  const { txId = '' } = useParams()
  const { events } = useTransactionEvents(txId)

  const {
    data: tx,
    isFetching,
    isError,
    error,
    refetch
  } = useGetTransactionByHashQuery(txId, {
    skip: !txId
  })

  const isLoading = isFetching
  const isInvalidFormat =
    isError && error && 'data' in error && (error.data as { code?: number })?.code === 3
  const isTxNotFound = !isLoading && !isInvalidFormat && !tx

  const refetchTx = useCallback(() => {
    refetch()
  }, [refetch])

  const {
    isWaitingForTick,
    isTickCheckFailed,
    targetTick,
    currentTick,
    estimatedWaitSeconds,
    isLoading: isTickWatcherLoading
  } = useTickWatcher({
    isTxNotFound,
    refetch: refetchTx
  })

  if (isLoading) {
    return <LinearProgress />
  }

  if (isInvalidFormat) {
    return <ErrorFallback message={t('invalidTransactionId')} hideErrorHeader />
  }

  if (isTickWatcherLoading) {
    return <LinearProgress />
  }

  if (isTickCheckFailed) {
    return <ErrorFallback message={t('tickCheckFailed')} hideErrorHeader />
  }

  if (isWaitingForTick && targetTick) {
    return (
      <WaitingForTick
        txId={txId}
        targetTick={targetTick}
        currentTick={currentTick}
        estimatedWaitSeconds={estimatedWaitSeconds}
      />
    )
  }

  if (!tx) {
    return <ErrorFallback message={t('transactionNotFound')} hideErrorHeader />
  }

  return (
    <PageLayout>
      <Breadcrumbs aria-label="breadcrumb">
        <HomeLink />
        <p className="font-space text-xs text-gray-50">
          {t('tick')} <TickLink className="text-xs text-gray-50" value={tx.tickNumber} />
        </p>
        <p className="font-space text-xs text-primary-30">{formatEllipsis(tx.hash)}</p>
      </Breadcrumbs>
      <p className="my-16 font-space text-24 leading-28">{t('transactionPreview')}</p>
      <TxItem
        tx={tx}
        nonExecutedTxIds={tx.moneyFlew ? [] : [tx.hash]}
        variant="secondary"
        timestamp={tx.timestamp}
      />
      <div className="mt-24">
        <TransactionEvents
          events={events}
          showTxId={false}
          header={`${t('events')} (${events.length})`}
        />
      </div>
    </PageLayout>
  )
}

const TxPageWithHelmet = withHelmet(TxPage, {
  title: 'Transaction | Qubic Explorer'
})

export default TxPageWithHelmet
