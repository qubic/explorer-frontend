import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import { Alert, Breadcrumbs } from '@app/components/ui'
import { ChevronToggleButton, CopyTextButton } from '@app/components/ui/buttons'
import { LinearProgress } from '@app/components/ui/loaders'
import { useAppDispatch, useAppSelector } from '@app/hooks/redux'
import { getAddress, resetState, selectAddress } from '@app/store/network/addressSlice'
import { getOverview, selectOverview } from '@app/store/network/overviewSlice'
import { formatEllipsis, formatString } from '@app/utils'
import { MAIN_ASSETS_ISSUER } from '@app/utils/qubic-ts'
import { AddressLink, CardItem, HomeLink } from '../components'
import { AddressDetails, TransactionsOverview } from './components'

export default function AddressPage() {
  const { t } = useTranslation('network-page')
  const dispatch = useAppDispatch()
  const { addressId = '' } = useParams()
  const { address, isLoading: isAddressLoading } = useAppSelector(selectAddress)
  const { overview, isLoading: isOverviewLoading } = useAppSelector(selectOverview)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const handleToggleDetails = () => {
    setDetailsOpen((prev) => !prev)
  }

  useEffect(() => {
    if (address?.addressId && addressId !== address.addressId) {
      dispatch(resetState())
    }
    if (!address && !isAddressLoading) {
      dispatch(getAddress(addressId))
    }
    if (!overview && !isOverviewLoading) {
      dispatch(getOverview())
    }
  }, [addressId, dispatch, overview, address, isAddressLoading, isOverviewLoading])

  if (isAddressLoading) {
    return <LinearProgress />
  }

  if (!address) {
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
        <p className="font-space text-12 text-primary-30">
          {t('id')} {formatEllipsis(addressId)}
        </p>
      </Breadcrumbs>
      <div className="flex items-center gap-12 pb-8 pt-16">
        <p className="break-all font-space text-16 leading-20 text-gray-50">{addressId}</p>
        <CopyTextButton text={addressId} />
      </div>
      <div>
        <div className="flex flex-col">
          <div className="flex items-center gap-10">
            <p className="leading-30 w-fit break-all font-space text-24 sm:text-36">
              {formatString(address.balance.balance)} <span className="text-gray-50">QUBIC</span>
            </p>
            <ChevronToggleButton
              aria-label="toggle-address-details"
              isOpen={detailsOpen}
              onClick={handleToggleDetails}
            />
          </div>
          <p className="my-5 font-space text-16 leading-18 text-gray-50">
            ${formatString(+address.balance.balance * (overview?.price ?? 0))}
          </p>
        </div>
        {detailsOpen && <AddressDetails address={address} />}
        {address.assets.length > 0 && (
          <CardItem tag="ul" className="mt-16 flex flex-wrap gap-16 p-12">
            {address.assets.map((asset) => (
              <li
                key={`${asset.assetName}-${asset.issuerIdentity}`}
                className="flex items-center gap-8"
              >
                <p className="font-space text-base text-white">{formatString(asset.ownedAmount)}</p>
                {asset.issuerIdentity === MAIN_ASSETS_ISSUER ? (
                  <p className="font-space text-base text-gray-50">{asset.assetName}</p>
                ) : (
                  <AddressLink
                    label={asset.assetName}
                    value={asset.issuerIdentity}
                    className="!text-base"
                  />
                )}
              </li>
            ))}
          </CardItem>
        )}
      </div>
      <TransactionsOverview address={address} addressId={addressId} />
    </div>
  )
}
