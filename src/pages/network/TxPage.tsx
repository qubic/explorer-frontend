import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import { withHelmet } from '@app/components/hocs'
import { Breadcrumbs } from '@app/components/ui'
import { ErrorFallback } from '@app/components/ui/error-boundaries'
import { PageLayout } from '@app/components/ui/layouts'
import { LinearProgress } from '@app/components/ui/loaders'
import { usePageAutoCorrect, useValidatedPage, useValidatedPageSize } from '@app/hooks'
import {
  useGetEventsQuery,
  type ParsedVirtualTxId,
  parseVirtualTxId,
  getLastProcessedTickFromEventsError
} from '@app/store/apis/events'
import { useGetTransactionByHashQuery } from '@app/store/apis/query-service'
import { formatDate, formatEllipsis } from '@app/utils'
import { CardItem, HomeLink, SubCardItem, TickLink, TxItem, WaitingForTick } from './components'
import TransactionEvents from './components/TxItem/TransactionEvents'
import { useTickWatcher, useTransactionEvents } from './hooks'
import { getEventsErrorMessage } from './utils/filterUtils'

const VIRTUAL_TX_TYPE_LABELS: Record<number, string> = {
  2: 'Smart Contract Begin Epoch',
  3: 'Smart Contract Begin Tick',
  4: 'Smart Contract End Tick',
  5: 'Smart Contract End Epoch'
}

function VirtualTxContent({ txId, virtualTx }: { txId: string; virtualTx: ParsedVirtualTxId }) {
  const { t } = useTranslation('network-page')

  const page = useValidatedPage()
  const pageSize = useValidatedPageSize()
  const offset = (page - 1) * pageSize

  const { data, isFetching, isError, error } = useGetEventsQuery({
    tickNumber: virtualTx.tickNumber,
    category: virtualTx.category,
    offset,
    size: pageSize
  })

  const total = data?.total ?? 0
  usePageAutoCorrect(!!data, total, pageSize)

  const events = data?.events ?? []
  const txTypeLabel = VIRTUAL_TX_TYPE_LABELS[virtualTx.category] ?? `Category ${virtualTx.category}`

  const firstEvent = data?.events?.[0]
  const firstEventTimestamp = firstEvent?.timestamp
  const epoch = firstEvent?.epoch
  const { date, time } = useMemo(
    () =>
      formatDate(firstEventTimestamp !== undefined ? String(firstEventTimestamp) : undefined, {
        split: true
      }),
    [firstEventTimestamp]
  )

  const lastProcessedTick = isError ? getLastProcessedTickFromEventsError(error) : null

  if (isFetching && events.length === 0) return <LinearProgress />
  if (isError) {
    return (
      <ErrorFallback
        message={
          lastProcessedTick !== null
            ? t('tickNotYetProcessedEvents', {
                lastProcessedTick: lastProcessedTick.toLocaleString()
              })
            : t('virtualTransactionNotFound')
        }
        hideErrorHeader
      />
    )
  }

  return (
    <PageLayout>
      <Breadcrumbs aria-label="breadcrumb">
        <HomeLink />
        <p className="font-space text-xs text-gray-50">
          {t('tick')} <TickLink className="text-xs text-gray-50" value={virtualTx.tickNumber} />
        </p>
        <p className="font-space text-xs text-primary-30">{txId}</p>
      </Breadcrumbs>

      <p className="my-16 font-space text-base font-500">{t('transactionPreview')}</p>

      <div className="mb-16 rounded-8 border-1 border-info-40/30 bg-info-90 px-16 py-14">
        <p className="text-sm text-gray-50">{t('virtualTransactionBanner')}</p>
      </div>

      <CardItem className="p-20">
        <SubCardItem
          variant="secondary"
          title={t('txID')}
          content={<p className="font-space text-sm">{txId}</p>}
          hideTopBorder
        />
        <SubCardItem
          variant="secondary"
          title={t('txType')}
          content={<p className="font-space text-sm">{txTypeLabel}</p>}
        />
        <SubCardItem
          variant="secondary"
          title={t('tick')}
          content={<TickLink className="text-sm text-primary-30" value={virtualTx.tickNumber} />}
        />
        {epoch != null && (
          <SubCardItem
            variant="secondary"
            title={t('epoch')}
            content={<p className="font-space text-sm">{epoch}</p>}
          />
        )}
        {date && (
          <SubCardItem
            variant="secondary"
            title={t('timestamp')}
            content={
              <p className="font-space text-sm">
                <span className="text-white">{date}</span>{' '}
                <span className="text-gray-50">{time}</span>
              </p>
            }
          />
        )}
      </CardItem>

      <div className="mt-24">
        <TransactionEvents
          events={events}
          total={total}
          isLoading={isFetching}
          paginated
          showTxId={false}
          header={t('events')}
          validForTick={data?.validForTick}
        />
      </div>
    </PageLayout>
  )
}

function RegularTxContent({ txId }: { txId: string }) {
  const { t } = useTranslation('network-page')
  const {
    events,
    total,
    isLoading: isEventsLoading,
    hasError: hasEventsError,
    lastProcessedTick: eventsLastProcessedTick,
    validForTick
  } = useTransactionEvents(txId)

  const eventsErrorMessage = getEventsErrorMessage(hasEventsError, eventsLastProcessedTick, t)

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
      <p className="my-16 font-space text-base font-500">{t('transactionPreview')}</p>
      <TxItem
        tx={tx}
        nonExecutedTxIds={tx.moneyFlew ? [] : [tx.hash]}
        variant="secondary"
        timestamp={tx.timestamp}
      />
      <div className="mt-24">
        <TransactionEvents
          events={events}
          total={total}
          isLoading={isEventsLoading}
          paginated
          showTxId={false}
          header={t('events')}
          errorMessage={eventsErrorMessage}
          validForTick={validForTick}
        />
      </div>
    </PageLayout>
  )
}

function TxPage() {
  const { txId = '' } = useParams()
  const virtualTx = useMemo(() => parseVirtualTxId(txId), [txId])

  if (virtualTx) {
    return <VirtualTxContent txId={txId} virtualTx={virtualTx} />
  }

  return <RegularTxContent txId={txId} />
}

const TxPageWithHelmet = withHelmet(TxPage, {
  title: 'Transaction | Qubic Explorer'
})

export default TxPageWithHelmet
