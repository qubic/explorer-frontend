import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import { ArrowTopRightOnSquareIcon } from '@app/assets/icons'
import { withHelmet } from '@app/components/hocs'
import { Badge, Breadcrumbs, Tabs } from '@app/components/ui'
import { ChevronToggleButton, CopyTextButton } from '@app/components/ui/buttons'
import { ErrorFallback } from '@app/components/ui/error-boundaries'
import { PageLayout } from '@app/components/ui/layouts'
import { LinearProgress } from '@app/components/ui/loaders'
import { useGetAddressBalancesQuery, useGetLatestStatsQuery } from '@app/store/apis/archiver-v1'
import { clsxTwMerge, formatEllipsis, formatString } from '@app/utils'
import { AddressType, getAddressName } from '@app/utils/qubic'
import { HomeLink } from '../components'
import { AddressDetails, ContractOverview, OwnedAssets, TransactionsOverview } from './components'

function AddressPage() {
  const { t } = useTranslation('network-page')
  const { addressId = '' } = useParams()
  const latestStats = useGetLatestStatsQuery()
  const addressBalances = useGetAddressBalancesQuery({ address: addressId }, { skip: !addressId })

  const [detailsOpen, setDetailsOpen] = useState(false)

  const handleToggleDetails = useCallback(() => {
    setDetailsOpen((prev) => !prev)
  }, [])

  const formattedBalanceUsd = useMemo(() => {
    if (!addressBalances.data || !latestStats.data) return ''
    return formatString(+addressBalances.data.balance * (latestStats.data.price ?? 0))
  }, [addressBalances.data, latestStats.data])

  const addressName = useMemo(() => getAddressName(addressId), [addressId])
  const isSmartContract = addressName?.type === AddressType.SmartContract

  if (addressBalances.isFetching) {
    return <LinearProgress />
  }

  if (!addressBalances.data) {
    return <ErrorFallback message={t('addressNotFoundError')} />
  }

  return (
    <PageLayout>
      <Breadcrumbs aria-label="breadcrumbs">
        <HomeLink />
        <p className="font-space text-xs text-primary-30">
          {t('id')} {formatEllipsis(addressId)}
        </p>
      </Breadcrumbs>

      <div className="flex items-center gap-12 pb-6 pt-16">
        <p className="break-all font-space text-base text-gray-50">{addressId}</p>
        <CopyTextButton text={addressId} />
      </div>

      {addressName && (
        <div className="flex items-center gap-4 pb-16">
          <Badge
            color="primary"
            size="xs"
            variant="outlined"
            className={clsxTwMerge({ 'hover:bg-primary-60': addressName.website })}
          >
            {addressName.website ? (
              <a
                href={addressName.website}
                target="_blank"
                rel="noreferrer"
                className="flex items-center"
              >
                {addressName.name}
                <ArrowTopRightOnSquareIcon className="mb-1.5 ml-4 size-12 text-primary-20" />
              </a>
            ) : (
              addressName.name
            )}
          </Badge>
          <Badge color="primary" size="xs" variant="outlined">
            {t(addressName.i18nKey)}
          </Badge>
        </div>
      )}

      <div>
        <div className="flex flex-col">
          <div className="flex items-center gap-10">
            <p className="w-fit break-all font-space text-2xl sm:text-36">
              {formatString(addressBalances.data.balance)}{' '}
              <span className="text-gray-50">QUBIC</span>
            </p>
            <ChevronToggleButton
              aria-label="toggle-address-details"
              isOpen={detailsOpen}
              onClick={handleToggleDetails}
            />
          </div>
          <p className="mb-12 mt-8 font-space text-base text-gray-50">${formattedBalanceUsd}</p>
        </div>

        <AddressDetails
          address={addressBalances.data}
          price={latestStats.data?.price ?? 0}
          isVisible={detailsOpen}
        />

        <OwnedAssets addressId={addressId} />
      </div>

      <Tabs variant="buttons" className="mt-40">
        <Tabs.List>
          <Tabs.Tab>{t('transactions')}</Tabs.Tab>
          {isSmartContract && <Tabs.Tab>{t('contract')}</Tabs.Tab>}
        </Tabs.List>
        <Tabs.Panels>
          <Tabs.Panel>
            <TransactionsOverview address={addressBalances.data} addressId={addressId} />
          </Tabs.Panel>
          {isSmartContract && (
            <Tabs.Panel>
              <ContractOverview
                asset={addressName.name}
                githubUrl={addressName.githubUrl}
                proposalUrl={addressName.proposalUrl}
              />
            </Tabs.Panel>
          )}
        </Tabs.Panels>
      </Tabs>
    </PageLayout>
  )
}

const AddressPageWithHelmet = withHelmet(AddressPage, {
  title: 'Address | Qubic Explorer',
  meta: [{ name: 'description', content: 'Check the details of an address in Qubic Network' }]
})

export default AddressPageWithHelmet
