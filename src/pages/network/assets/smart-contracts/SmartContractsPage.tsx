import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { withHelmet } from '@app/components/hocs'
import { Breadcrumbs } from '@app/components/ui'
import { PageLayout } from '@app/components/ui/layouts'
import { SMART_CONTRACTS } from '@app/constants/qubic'
import { useTailwindBreakpoint } from '@app/hooks'
import { EMPTY_ADDRESS } from '@app/utils/qubic-ts'
import { AddressLink, CardItem, HomeLink } from '../../components'
import { SmartContractRow } from './components'

function SmartContractsPage() {
  const { t } = useTranslation('network-page')
  const { isMobile } = useTailwindBreakpoint()

  const renderTableContent = useCallback(() => {
    return Object.entries(SMART_CONTRACTS).map(([address, details]) => (
      <SmartContractRow key={address} address={address} details={details} isMobile={isMobile} />
    ))
  }, [isMobile])

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
        <CardItem tag="ul" className="mt-16 flex flex-wrap gap-16 p-12">
          <div className="flex gap-8 py-12 text-sm">
            <p className="text-gray-50">{t('sharesIssuer')}</p>
            <AddressLink value={EMPTY_ADDRESS} className="sm:text-sm" copy />
          </div>
        </CardItem>
        <div className="w-full rounded-12 border-1 border-primary-60 bg-primary-70">
          <div className="overflow-x-scroll">
            <table className="w-full">
              <thead className="border-b-1 border-primary-60 text-left font-space text-sm text-gray-50">
                <tr>
                  <th className="w-[6ch] whitespace-nowrap px-10 py-16 text-right text-xs font-400 sm:p-16 sm:text-sm">
                    <span className="text-gray-50">{t('contractIndex')}</span>
                  </th>
                  <th className="px-10 py-16 text-left text-xs font-400 sm:w-72 sm:p-16 sm:text-sm">
                    <span className="text-gray-50">{t('name')}</span>
                  </th>
                  <th className="px-10 py-16 text-xs font-400 sm:p-16 sm:text-sm">
                    <span className="text-gray-50">{t('address')}</span>
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
