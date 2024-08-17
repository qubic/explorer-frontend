import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import { Alert, Breadcrumbs } from '@app/components/ui'
import { LinearProgress } from '@app/components/ui/loaders'
import { useAppDispatch, useAppSelector } from '@app/hooks/redux'
import type { TransactionStatus } from '@app/services/archiver'
import { getTx, selectTx } from '@app/store/network/txSlice'
import { formatEllipsis } from '@app/utils'
import { HomeLink, TickLink, TxItem } from './components'
import { useValidatedTxType } from './hooks'

export default function TxPage() {
  const { t } = useTranslation('network-page')
  const dispatch = useAppDispatch()
  const { txWithStatus, isLoading } = useAppSelector(selectTx)
  const { txId } = useParams()
  const txType = useValidatedTxType()

  const getNonExecutedTxIds = (status: TransactionStatus) => {
    return status?.moneyFlew ? [] : [status?.txId]
  }

  useEffect(() => {
    dispatch(getTx({ txId, txType }))
  }, [txId, txType, dispatch])

  if (isLoading) {
    return <LinearProgress />
  }

  return (
    <div className="w-full">
      <div className="mx-auto max-w-[960px] px-12 py-32">
        {txWithStatus?.tx ? (
          <>
            {txType === 'historical' && (
              <Alert variant="info" className="mb-24" size="sm">
                {t('historicalDataWarning')}
              </Alert>
            )}
            <Breadcrumbs aria-label="breadcrumb">
              <HomeLink />
              <p className="font-space text-xs text-gray-50">
                {t('tick')}{' '}
                <TickLink className="text-xs text-gray-50" value={txWithStatus.tx.tickNumber} />
              </p>
              <p className="font-space text-xs text-primary-40">
                {formatEllipsis(txWithStatus.tx.txId)}
              </p>
            </Breadcrumbs>
            <p className="my-16 font-space text-24 leading-28">{t('transactionPreview')}</p>
            <TxItem
              tx={txWithStatus.tx}
              nonExecutedTxIds={getNonExecutedTxIds(txWithStatus.status)}
              variant="secondary"
            />
          </>
        ) : (
          <p className="my-16 text-center font-space text-24 leading-28">
            {t('transactionNotFound')}
          </p>
        )}
      </div>
    </div>
  )
}
