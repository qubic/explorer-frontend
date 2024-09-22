import type { Address } from '@app/store/network/addressSlice'
import { formatString } from '@app/utils'
import { useTranslation } from 'react-i18next'
import { CardItem, TickLink } from '../../components'

type Props = {
  address: Address
}

export default function AddressDetails({ address }: Props) {
  const { t } = useTranslation('network-page')

  return (
    <div className="grid gap-16 pt-12 948px:grid-cols-3">
      {(Object.entries(address.reportedValues) || []).map(([ip, details]) => (
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
  )
}
