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
import { useTickWatcher } from './hooks'

function TxPage() {
  const { t } = useTranslation('network-page')
  const { txId = '' } = useParams()

  const {
    data: tx,
    isFetching,
    refetch
  } = useGetTransactionByHashQuery(txId, {
    skip: !txId
  })

  const isLoading = isFetching
  const isTxNotFound = !isLoading && !tx

  const refetchTx = useCallback(() => {
    refetch()
  }, [refetch])

  const {
    isWaitingForTick,
    isOutOfRange,
    targetTick,
    currentTick,
    remaining,
    isLoading: isTickWatcherLoading
  } = useTickWatcher({
    isTxNotFound,
    refetch: refetchTx
  })

  if (isLoading || isTickWatcherLoading) {
    return <LinearProgress />
  }

  if ((isWaitingForTick || isOutOfRange) && targetTick) {
    return (
      <WaitingForTick
        txId={txId}
        targetTick={targetTick}
        currentTick={currentTick}
        remaining={remaining}
        isOutOfRange={isOutOfRange}
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
    </PageLayout>
  )
}

const TxPageWithHelmet = withHelmet(TxPage, {
  title: 'Transaction | Qubic Explorer'
})

export default TxPageWithHelmet
