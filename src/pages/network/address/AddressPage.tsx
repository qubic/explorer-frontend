import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import { Alert, Breadcrumbs, Tabs } from '@app/components/ui'
import { ChevronToggleButton, CopyTextButton } from '@app/components/ui/buttons'
import { LinearProgress } from '@app/components/ui/loaders'
import { useAppDispatch, useAppSelector } from '@app/hooks/redux'
import { getAddress, resetState, selectAddress } from '@app/store/network/addressSlice'
import { getOverview, selectOverview } from '@app/store/network/overviewSlice'
import { formatEllipsis, formatString } from '@app/utils'
import { CardItem, HomeLink, TickLink } from '../components'
import { HistoricalTxs, Transactions } from './components'

export default function AddressPage() {
  const { t } = useTranslation('network-page')
  const dispatch = useAppDispatch()
  const { addressId = '' } = useParams()
  const { address, isLoading } = useAppSelector(selectAddress)
  const { overview } = useAppSelector(selectOverview)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const handleToggleDetails = () => {
    setDetailsOpen((prev) => !prev)
  }

  useEffect(() => {
    dispatch(getAddress(addressId))
    if (!overview) {
      dispatch(getOverview())
    }
    return () => {
      dispatch(resetState())
    }
  }, [addressId, dispatch, overview])

  if (isLoading) {
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
              {formatString(address?.balance?.balance)} <span className="text-gray-50">QUBIC</span>
            </p>
            <ChevronToggleButton
              aria-label="toggle-address-details"
              isOpen={detailsOpen}
              onClick={handleToggleDetails}
            />
          </div>
          <p className="my-5 font-space text-16 leading-18 text-gray-50">
            ${formatString(+(address?.balance?.balance ?? 0) * (overview?.price ?? 0))}
          </p>
        </div>
        {detailsOpen && (
          <div className="grid gap-16 pt-12 948px:grid-cols-3">
            {address &&
              (Object.entries(address?.reportedValues) || []).map(([ip, details]) => (
                <CardItem className="p-16" key={ip}>
                  <div className="mb-16 flex justify-between">
                    <div className="">
                      <p className="font-space text-14 leading-18 text-gray-50">{t('value')}</p>
                      <p className="font-space text-16 font-500 leading-20">
                        {formatString(details.incomingAmount - details.outgoingAmount)}{' '}
                        <span className="text-gray-50">QUBIC</span>
                      </p>
                    </div>
                    <p className="font-space text-14 leading-18 text-gray-50">{ip}</p>
                  </div>
                  <div className="flex flex-col items-center gap-8 948px:items-start">
                    <p className="font-space text-14 leading-18 text-gray-50">
                      {t('incoming')}:
                      <span className="text-white"> {details.numberOfIncomingTransfers} </span>(
                      {t('latest')}:{' '}
                      <TickLink
                        value={details.latestIncomingTransferTick}
                        className="break-all text-primary-30"
                      />
                      )
                    </p>
                    <p className="font-space text-14 leading-18 text-gray-50">
                      {t('outgoing')}:
                      <span className="text-white"> {details.numberOfOutgoingTransfers} </span>(
                      {t('latest')}:{' '}
                      <TickLink
                        value={details.latestOutgoingTransferTick}
                        className="break-all text-primary-30"
                      />
                      )
                    </p>
                  </div>
                </CardItem>
              ))}
          </div>
        )}
      </div>
      <div className="mt-40">
        <p className="my-10 font-space text-20 font-500 leading-26">{t('transactions')}</p>
        <Tabs>
          <Tabs.List>
            <Tabs.Tab>{t('latest')}</Tabs.Tab>
            <Tabs.Tab>{t('historical')}</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panels>
            <Tabs.Panel>
              <Transactions addressId={addressId} address={address} />
            </Tabs.Panel>
            <Tabs.Panel>
              <HistoricalTxs addressId={addressId} />
            </Tabs.Panel>
          </Tabs.Panels>
        </Tabs>
      </div>
    </div>
  )
}
