import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import { withHelmet } from '@app/components/hocs'
import { Alert, Breadcrumbs } from '@app/components/ui'
import { ErrorFallback } from '@app/components/ui/error-boundaries'
import { PageLayout } from '@app/components/ui/layouts'
import { LinearProgress } from '@app/components/ui/loaders'
import { useGetTransactionQuery } from '@app/store/apis/archiver-v2'
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

  const { transaction, moneyFlew, timestamp } = archiverTx.data ?? qliTx.data ?? {}

  if (archiverTx.isFetching || qliTx.isFetching) {
    return <LinearProgress />
  }

  if (!transaction) {
    return <ErrorFallback message={t('transactionNotFound')} />
  }

  return (
    <PageLayout>
      {txEra === 'historical' && (
        <Alert variant="info" className="mb-24" size="sm">
          {t('historicalDataWarning')}
        </Alert>
      )}
      <Breadcrumbs aria-label="breadcrumb">
        <HomeLink />
        <p className="font-space text-xs text-gray-50">
          {t('tick')} <TickLink className="text-xs text-gray-50" value={transaction.tickNumber} />
        </p>
        <p className="font-space text-xs text-primary-30">{formatEllipsis(transaction.txId)}</p>
      </Breadcrumbs>
      <p className="my-16 font-space text-24 leading-28">{t('transactionPreview')}</p>
      <TxItem
        tx={transaction}
        nonExecutedTxIds={moneyFlew ? [] : [transaction.txId]}
        variant="secondary"
        timestamp={timestamp}
      />
    </PageLayout>
  )
}

const TxPageWithHelmet = withHelmet(TxPage, {
  title: 'Transaction | Qubic Explorer'
})

export default TxPageWithHelmet
