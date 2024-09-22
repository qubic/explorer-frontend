import { useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import { Alert, Breadcrumbs } from '@app/components/ui'
import { LinearProgress } from '@app/components/ui/loaders'
import { useAppDispatch, useAppSelector } from '@app/hooks/redux'
import type { TransactionStatus } from '@app/services/archiver'
import { useGetTransactionQuery } from '@app/store/apis/archiver-v2.api'
import { convertTxV2ToTxWithStatus } from '@app/store/network/adapters'
import { getTx, selectTx } from '@app/store/network/txSlice'
import { formatEllipsis } from '@app/utils'
import { HomeLink, TickLink, TxItem } from './components'
import { useValidatedTxEra } from './hooks'

export default function TxPage() {
  const { t } = useTranslation('network-page')
  const dispatch = useAppDispatch()
  const { txWithStatus, isLoading } = useAppSelector(selectTx)
  const { txId } = useParams()
  const txEra = useValidatedTxEra()
  const { data, isFetching } = useGetTransactionQuery(txId ?? '', {
    skip: !txId || txEra === 'historical'
  })

  const getNonExecutedTxIds = useCallback(
    (status: TransactionStatus) => (status?.moneyFlew ? [] : [status?.txId]),
    []
  )

  const transaction = txWithStatus || (data && convertTxV2ToTxWithStatus(data))

  useEffect(() => {
    dispatch(getTx({ txId, txEra }))
  }, [txId, txEra, dispatch])

  if (isLoading || isFetching) {
    return <LinearProgress />
  }

  if (!transaction) {
    return (
      <p className="mx-auto my-16 max-w-[960px] px-12 py-32 text-center font-space text-24 leading-28">
        {t('transactionNotFound')}
      </p>
    )
  }

  return (
    <div className="w-full">
      <div className="mx-auto max-w-[960px] px-12 py-32">
        {txEra === 'historical' && (
          <Alert variant="info" className="mb-24" size="sm">
            {t('historicalDataWarning')}
          </Alert>
        )}
        <Breadcrumbs aria-label="breadcrumb">
          <HomeLink />
          <p className="font-space text-xs text-gray-50">
            {t('tick')}{' '}
            <TickLink className="text-xs text-gray-50" value={transaction.tx.tickNumber} />
          </p>
          <p className="font-space text-xs text-primary-30">
            {formatEllipsis(transaction.tx.txId)}
          </p>
        </Breadcrumbs>
        <p className="my-16 font-space text-24 leading-28">{t('transactionPreview')}</p>
        <TxItem
          tx={transaction.tx}
          nonExecutedTxIds={getNonExecutedTxIds(transaction.status)}
          variant="secondary"
          timestamp={transaction.timestamp}
        />
      </div>
    </div>
  )
}
