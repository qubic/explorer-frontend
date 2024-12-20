import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import { withHelmet } from '@app/components/hocs'
import { Alert, Breadcrumbs } from '@app/components/ui'
import { ChevronToggleButton, CopyTextButton } from '@app/components/ui/buttons'
import { LinearProgress } from '@app/components/ui/loaders'
import { useGetAddressBalancesQuery, useGetLatestStatsQuery } from '@app/store/apis/archiver-v1'
import { formatEllipsis, formatString } from '@app/utils'
import { HomeLink } from '../components'
import { AddressDetails, OwnedAssets, TransactionsOverview } from './components'

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

  if (addressBalances.isFetching) {
    return <LinearProgress />
  }

  if (!addressBalances.data) {
    return (
      <div className="mx-auto my-32 max-w-[960px] px-12">
        <Alert variant="error">{t('addressNotFoundError')}</Alert>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[960px] px-12 py-16">
      <Breadcrumbs aria-label="breadcrumbs">
        <HomeLink />
        <p className="font-space text-xs text-primary-30">
          {t('id')} {formatEllipsis(addressId)}
        </p>
      </Breadcrumbs>

      <div className="flex items-center gap-12 py-16">
        <p className="break-all font-space text-base text-gray-50">{addressId}</p>
        <CopyTextButton text={addressId} />
      </div>

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

      <TransactionsOverview address={addressBalances.data} addressId={addressId} />
    </div>
  )
}

const AddressPageWithHelmet = withHelmet(AddressPage, {
  title: 'Address | Qubic Explorer',
  meta: [{ name: 'description', content: 'Check the details of an address in Qubic Network' }]
})

export default AddressPageWithHelmet
