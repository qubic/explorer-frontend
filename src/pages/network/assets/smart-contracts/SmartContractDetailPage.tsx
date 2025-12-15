import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import { withHelmet } from '@app/components/hocs'
import { Breadcrumbs } from '@app/components/ui'
import { PageLayout } from '@app/components/ui/layouts'
import { Routes } from '@app/router/routes'
import { useGetSmartContractsQuery } from '@app/store/apis/qubic-static'
import { AddressLink, HomeLink } from '../../components'
import {
  BalanceHistoryChart,
  FeeReserveStats,
  InflowsOutflowsChart,
  RecentEventsTable
} from './components'
import { getMockFeeReserveData } from './mock-data'

function SmartContractDetailPage() {
  const { t } = useTranslation('network-page')
  const { contractId } = useParams<{ contractId: string }>()
  const { data: smartContracts } = useGetSmartContractsQuery()

  const contract = useMemo(
    () => smartContracts?.find((c) => c.address === contractId),
    [smartContracts, contractId]
  )

  const feeReserveData = useMemo(
    () => (contractId ? getMockFeeReserveData(contractId) : null),
    [contractId]
  )

  if (!contractId || !feeReserveData) {
    return (
      <PageLayout className="space-y-20">
        <p className="text-center text-gray-50">{t('contractNotFound')}</p>
      </PageLayout>
    )
  }

  return (
    <PageLayout className="space-y-20">
      <Breadcrumbs aria-label="breadcrumb">
        <HomeLink />
        <a href={Routes.NETWORK.ASSETS.SMART_CONTRACTS} className="text-xs text-gray-50">
          {t('smartContracts')}
        </a>
        <p className="text-xs text-primary-30">{contract?.name || t('contractDetails')}</p>
      </Breadcrumbs>

      <div className="space-y-24">
        <div className="space-y-8">
          <div className="flex flex-wrap items-center gap-8">
            <h1 className="font-space text-24 font-500">{contract?.name || t('smartContract')}</h1>
            {contract?.label && (
              <span className="rounded-full bg-primary-60 px-12 py-4 text-xs text-gray-50">
                {contract.label}
              </span>
            )}
          </div>
          <div className="flex items-center gap-8">
            <span className="text-sm text-gray-50">{t('address')}:</span>
            <AddressLink value={contractId} copy />
          </div>
        </div>

        <div className="space-y-8">
          <h2 className="font-space text-18 font-500">{t('feeReserve')}</h2>
          <p className="text-sm text-gray-50">{t('feeReserveDescription')}</p>
        </div>

        <FeeReserveStats data={feeReserveData} />

        <div className="grid gap-16 lg:grid-cols-2">
          <BalanceHistoryChart
            dailyData={feeReserveData.dailySnapshots}
            epochData={feeReserveData.epochStats}
          />
          <InflowsOutflowsChart data={feeReserveData.epochStats} />
        </div>

        <RecentEventsTable events={feeReserveData.recentEvents} />
      </div>
    </PageLayout>
  )
}

const SmartContractDetailPageWithHelmet = withHelmet(SmartContractDetailPage, {
  title: 'Smart Contract Details | Qubic Explorer',
  meta: [{ name: 'description', content: 'View smart contract fee reserve details' }]
})

export default SmartContractDetailPageWithHelmet
