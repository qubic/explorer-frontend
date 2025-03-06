import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import type { GetAddressBalancesResponse } from '@app/store/apis/archiver-v1'
import { clsxTwMerge, formatString } from '@app/utils'
import { CardItem, TickLink } from '../../components'

type Props = {
  address: GetAddressBalancesResponse['balance']
  price: number
  isVisible: boolean
}

function AmountDetails({
  title,
  amount,
  amountUsd,
  className
}: {
  title: string
  amount: string
  amountUsd: string
  className: string
}) {
  return (
    <div className={`space-y-2 text-gray-50 ${className}`}>
      <p>{title}</p>
      <p className="text-sm font-500 text-white sm:text-base">
        {amount} <span>QUBIC</span>
      </p>
      <p className="text-xs sm:text-sm">${amountUsd}</p>
    </div>
  )
}

function TransferDetails({
  title,
  label,
  transfersCount,
  latestTransferTick,
  className
}: {
  title: string
  label: string
  transfersCount: string
  latestTransferTick: number
  className: string
}) {
  return (
    <div className={`space-y-2 text-gray-50 ${className}`}>
      <p>{title}</p>
      <p className="text-sm font-500 text-white sm:text-base">{transfersCount}</p>
      {latestTransferTick > 0 && (
        <p className="text-xs sm:text-sm">
          {label}: <TickLink value={latestTransferTick} className="text-primary-30" />
        </p>
      )}
    </div>
  )
}

export default function AddressDetails({ address, price, isVisible }: Props) {
  const { t } = useTranslation('network-page')

  const {
    formattedIncomingAmount,
    formattedIncomingAmountUsd,
    formattedOutgoingAmount,
    formattedOutgoingAmountUsd,
    formattedNumberOfIncomingTransfers,
    formattedNumberOfOutgoingTransfers
  } = useMemo(
    () => ({
      formattedIncomingAmount: formatString(address.incomingAmount),
      formattedIncomingAmountUsd: formatString(+address.incomingAmount * price),
      formattedOutgoingAmount: formatString(address.outgoingAmount),
      formattedOutgoingAmountUsd: formatString(+address.outgoingAmount * price),
      formattedNumberOfIncomingTransfers: formatString(+address.numberOfIncomingTransfers),
      formattedNumberOfOutgoingTransfers: formatString(+address.numberOfOutgoingTransfers)
    }),
    [
      address.incomingAmount,
      address.outgoingAmount,
      address.numberOfIncomingTransfers,
      address.numberOfOutgoingTransfers,
      price
    ]
  )

  return (
    <div
      className={clsxTwMerge(
        'overflow-hidden transition-all duration-500 ease-in-out',
        isVisible ? 'max-h-320 translate-y-0 opacity-100' : 'max-h-0 -translate-y-5 opacity-0'
      )}
    >
      <CardItem className="p-16">
        <div className="mb-16 grid justify-between gap-16 font-space text-sm xs:[grid-template-areas:'incoming-amount_incoming-transfers''outgoing-amount_outgoing-transfers'] md:[grid-template-areas:'incoming-amount_outgoing-amount_incoming-transfers_outgoing-transfers']">
          <AmountDetails
            title={t('incomingAmount')}
            amount={formattedIncomingAmount}
            amountUsd={formattedIncomingAmountUsd}
            className="md:[grid-area:incoming-amount]"
          />

          <TransferDetails
            title={t('incomingTransfers')}
            label={t('latest')}
            transfersCount={formattedNumberOfIncomingTransfers}
            latestTransferTick={address.latestIncomingTransferTick}
            className="md:[grid-area:incoming-transfers]"
          />

          <AmountDetails
            title={t('outgoingAmount')}
            amount={formattedOutgoingAmount}
            amountUsd={formattedOutgoingAmountUsd}
            className="md:[grid-area:outgoing-amount]"
          />
          <TransferDetails
            title={t('outgoingTransfers')}
            label={t('latest')}
            transfersCount={formattedNumberOfOutgoingTransfers}
            latestTransferTick={address.latestOutgoingTransferTick}
            className="md:[grid-area:outgoing-transfers]"
          />
        </div>
      </CardItem>
    </div>
  )
}
