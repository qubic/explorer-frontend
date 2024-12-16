import type { GetAddressBalancesResponse } from '@app/store/apis/archiver-v1.types'
import { clsxTwMerge, formatString } from '@app/utils'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
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
  transfersCount: number
  latestTransferTick: number
  className: string
}) {
  return (
    <div className={`space-y-2 text-gray-50 ${className}`}>
      <p>{title}</p>
      <p className="text-xs sm:text-sm">
        <span className="text-sm text-white sm:text-base"> {transfersCount} </span>
        {latestTransferTick > 0 && (
          <>
            ({label}: <TickLink value={latestTransferTick} className="text-primary-30" />)
          </>
        )}
      </p>
    </div>
  )
}

export default function AddressDetails({ address, price, isVisible }: Props) {
  const { t } = useTranslation('network-page')

  const {
    formattedIncomingAmount,
    formattedIncomingAmountUsd,
    formattedOutgoingAmount,
    formattedOutgoingAmountUsd
  } = useMemo(
    () => ({
      formattedIncomingAmount: formatString(address.incomingAmount),
      formattedIncomingAmountUsd: formatString(+address.incomingAmount * price),
      formattedOutgoingAmount: formatString(address.outgoingAmount),
      formattedOutgoingAmountUsd: formatString(+address.outgoingAmount * price)
    }),
    [address.incomingAmount, address.outgoingAmount, price]
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
            transfersCount={address.numberOfIncomingTransfers}
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
            transfersCount={address.numberOfOutgoingTransfers}
            latestTransferTick={address.latestOutgoingTransferTick}
            className="md:[grid-area:outgoing-transfers]"
          />
        </div>
      </CardItem>
    </div>
  )
}
