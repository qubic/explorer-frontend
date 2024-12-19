import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import { withHelmet } from '@app/components/hocs'
import { Alert, Breadcrumbs } from '@app/components/ui'
import { LinearProgress } from '@app/components/ui/loaders'
import type { TransactionStatus } from '@app/services/archiver'
import { useGetTransactionQuery } from '@app/store/apis/archiver-v2.api'
import { useGetQliTransactionQuery } from '@app/store/apis/qli'
import { formatEllipsis } from '@app/utils'
import { HomeLink, TickLink, TxItem } from './components'
import { useValidatedTxEra } from './hooks'

function TxPage() {
  const { t } = useTranslation('network-page')
  const { txId = '' } = useParams()
  const txEra = useValidatedTxEra()

  const archiverTx = useGetTransactionQuery(txId, {
    skip: !txId || txEra === 'historical'
  })
  const qliTx = useGetQliTransactionQuery(txId, {
    skip: !txId || txEra === 'latest'
  })

  const getNonExecutedTxIds = useCallback(
    (status: TransactionStatus) => (status?.moneyFlew ? [] : [status?.txId]),
    []
  )

  const transaction = archiverTx.data ?? qliTx.data

  if (archiverTx.isFetching || qliTx.isFetching) {
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

const TxPageWithHelmet = withHelmet(TxPage, {
  title: 'Transaction | Qubic Explorer'
})

export default TxPageWithHelmet
