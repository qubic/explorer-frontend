import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import { withHelmet } from '@app/components/hocs'
import { Alert, Breadcrumbs } from '@app/components/ui'
import { ErrorFallback } from '@app/components/ui/error-boundaries'
import { PageLayout } from '@app/components/ui/layouts'
import { LinearProgress } from '@app/components/ui/loaders'
import { useGetTransactionByHashQuery } from '@app/store/apis/query-service'
import { convertToQueryServiceTx } from '@app/store/apis/query-service/query-service.adapters'
import { useGetQliTransactionQuery } from '@app/store/apis/qli'
import { formatEllipsis } from '@app/utils'
import { HomeLink, TickLink, TxItem } from './components'
import { useValidatedTxEra } from './hooks'

function TxPage() {
  const { t } = useTranslation('network-page')
  const { txId = '' } = useParams()
  const txEra = useValidatedTxEra()

  const queryServiceTx = useGetTransactionByHashQuery(txId, {
    skip: !txId || txEra === 'historical'
  })
  const qliTx = useGetQliTransactionQuery(txId, {
    skip: !txId || txEra === 'latest'
  })

  const tx = useMemo(() => {
    if (queryServiceTx.data) {
      return queryServiceTx.data
    }
    if (qliTx.data) {
      return convertToQueryServiceTx(qliTx.data)
    }
    return undefined
  }, [queryServiceTx.data, qliTx.data])

  if (queryServiceTx.isFetching || qliTx.isFetching) {
    return <LinearProgress />
  }

  if (!tx) {
    return <ErrorFallback message={t('transactionNotFound')} hideErrorHeader />
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
