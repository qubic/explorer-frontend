import { memo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { withHelmet } from '@app/components/hocs'
import { Breadcrumbs } from '@app/components/ui'
import { PageLayout } from '@app/components/ui/layouts'
import { useTailwindBreakpoint } from '@app/hooks'
import { HomeLink } from '../../components'
import { ExchangeRow, ExchangesErrorRow, ExchangeSkeletonRow } from './components'
import { EXCHANGES_SKELETON_ROWS } from './constants'
import { useGetExchangesBalances } from './hooks'

const ExchangesLoadingRows = memo(() =>
  Array.from({ length: EXCHANGES_SKELETON_ROWS }).map((_, index) => (
    <ExchangeSkeletonRow key={String(`${index}`)} />
  ))
)

function ExchangesPage() {
  const { t } = useTranslation('network-page')
  const { isMobile } = useTailwindBreakpoint()

  const { exchangeWallets, isLoading, error } = useGetExchangesBalances()

  const renderTableContent = useCallback(() => {
    if (isLoading) return <ExchangesLoadingRows />

    if (error || exchangeWallets.length === 0) {
      return <ExchangesErrorRow />
    }

    return exchangeWallets.map((entity) => (
      <ExchangeRow key={entity.address} entity={entity} isMobile={isMobile} />
    ))
  }, [isLoading, error, exchangeWallets, isMobile])

  return (
    <PageLayout className="space-y-20">
      <Breadcrumbs aria-label="breadcrumb">
        <HomeLink />
        <p className="text-xs text-primary-30">{t('Exchanges')}</p>
      </Breadcrumbs>
      <div className="space-y-14 md:space-y-28">
        <div className="flex flex-col justify-between space-y-10 sm:flex-row sm:items-end">
          <div>
            <p className="font-space text-24 font-500 leading-26">{t('Exchanges')}</p>
          </div>
        </div>
        <div className="w-full rounded-12 border-1 border-primary-60 bg-primary-70">
          <div className="overflow-x-scroll">
            <table className="w-full">
              <thead className="border-b-1 border-primary-60 text-left font-space text-sm text-gray-50">
                <tr>
                  <th className="px-10 py-16 text-left text-xs font-400 sm:w-72 sm:p-16 sm:text-sm">
                    <span className="text-gray-50">{t('exchange')}</span>
                  </th>
                  <th className="px-10 py-16 text-xs font-400 sm:p-16 sm:text-sm">
                    <span className="text-gray-50">{t('addressID')}</span>
                  </th>
                  <th className="px-10 py-16 text-right text-xs font-400 sm:p-16 sm:text-sm">
                    <span className="text-gray-50">{t('amount')} (QUBIC)</span>
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

const ExchangesPageWithHelmet = withHelmet(ExchangesPage, {
  title: 'Exchanges | Qubic Explorer',
  meta: [{ name: 'description', content: 'Check the exchanges addresses of Qubic Network' }]
})

export default ExchangesPageWithHelmet
