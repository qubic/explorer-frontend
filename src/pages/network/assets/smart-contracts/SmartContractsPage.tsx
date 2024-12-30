import { memo, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { withHelmet } from '@app/components/hocs'
import { Breadcrumbs } from '@app/components/ui'
import { PageLayout } from '@app/components/ui/layouts'
import { useTailwindBreakpoint } from '@app/hooks'
import { useGetAssetsQuery } from '@app/store/apis/qx'
import { ASSETS_ISSUER_ADDRESS } from '@app/utils/qubic-ts'
import { HomeLink } from '../../components'
import { SmartContractRow, SmartContractsErrorRow, SmartContractSkeletonRow } from './components'

const SmartContractsLoadingRows = memo(() =>
  Array.from({ length: 10 }).map((_, index) => (
    <SmartContractSkeletonRow key={String(`${index}`)} />
  ))
)

function SmartContractsPage() {
  const { t } = useTranslation('network-page')
  const { isMobile } = useTailwindBreakpoint()

  const { data = [], isLoading, error } = useGetAssetsQuery()

  const smartContracts = useMemo(
    () => data.filter(({ issuer }) => issuer === ASSETS_ISSUER_ADDRESS),
    [data]
  )

  const renderTableContent = useCallback(() => {
    if (isLoading) return <SmartContractsLoadingRows />

    if (error || smartContracts.length === 0) {
      return <SmartContractsErrorRow />
    }

    return smartContracts.map((asset) => (
      <SmartContractRow key={asset.name} asset={asset} isMobile={isMobile} />
    ))
  }, [isLoading, error, smartContracts, isMobile])

  return (
    <PageLayout className="space-y-20">
      <Breadcrumbs aria-label="breadcrumb">
        <HomeLink />
        <p className="text-xs text-primary-30">{t('smartContracts')}</p>
      </Breadcrumbs>
      <div className="space-y-14 md:space-y-28">
        <div className="flex flex-col justify-between space-y-10 sm:flex-row sm:items-end">
          <div>
            <p className="font-space text-24 font-500 leading-26">{t('smartContracts')}</p>
          </div>
        </div>
        <div className="w-full rounded-12 border-1 border-primary-60 bg-primary-70">
          <div className="overflow-x-scroll">
            <table className="w-full">
              <thead className="border-b-1 border-primary-60 text-left font-space text-sm text-gray-50">
                <tr>
                  <th className="px-10 py-16 text-left text-xs font-400 sm:w-72 sm:p-16 sm:text-sm">
                    <span className="text-gray-50">{t('name')}</span>
                  </th>
                  <th className="px-10 py-16 text-xs font-400 sm:p-16 sm:text-sm">
                    <span className="text-gray-50">{t('issuer')}</span>
                  </th>
                </tr>
              </thead>
              <tbody>{renderTableContent()}</tbody>
            </table>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}

const SmartContractsPageWithHelmet = withHelmet(SmartContractsPage, {
  title: 'Smart Contracts | Qubic Explorer',
  meta: [{ name: 'description', content: 'Check the smart contracts of Qubic Network' }]
})

export default SmartContractsPageWithHelmet
