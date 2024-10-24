import { useTranslation } from 'react-i18next'

import type { Transaction } from '@app/services/archiver'
import { formatDate, formatString } from '@app/utils'
import type { AssetTransfer, Transfer } from '@app/utils/qubic-ts'
import { useMemo } from 'react'
import AddressLink from '../AddressLink'
import SubCardItem from '../SubCardItem'
import TickLink from '../TickLink'
import TxLink from '../TxLink'
import TransferList from './TransferList/TransferList'
import type { TxItemVariant } from './TxItem.types'

type Props = {
  txDetails: Omit<Transaction, 'inputSize' | 'signatureHex' | 'inputHex'>
  entries: Transfer[]
  isHistoricalTx?: boolean
  variant?: TxItemVariant
  assetDetails?: AssetTransfer
  timestamp?: string
}

function TransactionDetailsWrapper({
  children,
  variant
}: {
  children: React.ReactNode
  variant: TxItemVariant
}) {
  if (variant === 'secondary') {
    return children
  }

  return (
    <div className="mt-14 flex flex-col gap-12 border-t-1 border-primary-60 pt-12">{children}</div>
  )
}

export default function TransactionDetails({
  txDetails: { txId, sourceId, tickNumber, destId, inputType, amount },
  assetDetails,
  entries,
  isHistoricalTx = false,
  timestamp,
  variant = 'primary'
}: Props) {
  const { t } = useTranslation('network-page')

  const isSecondaryVariant = variant === 'secondary'
  const { date, time } = useMemo(() => formatDate(timestamp, { split: true }), [timestamp])

  return (
    <TransactionDetailsWrapper variant={variant}>
      {isSecondaryVariant ? (
        <SubCardItem
          variant="secondary"
          title={t('amount')}
          content={
            <p className="font-space text-sm">
              {assetDetails ? (
                <>
                  {formatString(assetDetails.units)} {assetDetails.assetName}
                </>
              ) : (
                <>{formatString(amount)} QUBIC</>
              )}
            </p>
          }
        />
      ) : (
        <SubCardItem
          title={`TX ${t('id')}`}
          variant={variant}
          content={
            <TxLink
              isHistoricalTx={isHistoricalTx}
              className="text-sm text-primary-30"
              value={txId}
              copy
            />
          }
        />
      )}

      {variant === 'secondary' && (
        <SubCardItem
          title={t('type')}
          variant={variant}
          content={
            <p className="font-space text-sm">
              {formatString(inputType)} {inputType === 0 ? 'Standard' : 'SC'}
            </p>
          }
        />
      )}

      <SubCardItem
        title={t('source')}
        variant={variant}
        content={<AddressLink value={sourceId} copy={!isSecondaryVariant} />}
      />
      <SubCardItem
        title={t('destination')}
        variant={variant}
        content={<AddressLink value={destId} copy={!isSecondaryVariant} />}
      />
      <SubCardItem
        title={t('tick')}
        variant={variant}
        content={<TickLink className="text-sm text-primary-30" value={tickNumber} />}
      />
      {variant === 'primary' && (
        <SubCardItem
          title={t('type')}
          variant={variant}
          content={
            <p className="font-space text-sm">
              {formatString(inputType)} {inputType === 0 ? 'Standard' : 'SC'}
            </p>
          }
        />
      )}

      {assetDetails?.units && (
        <SubCardItem
          title={t('fee')}
          variant={variant}
          content={<p className="font-space text-sm">{formatString(amount)} QUBIC</p>}
        />
      )}

      {timestamp && (
        <SubCardItem
          title={t('timestamp')}
          variant={variant}
          content={
            <p className="font-space text-sm">
              <span className="text-white">{date}</span>{' '}
              <span className="text-gray-50">{time}</span>
            </p>
          }
        />
      )}

      <TransferList entries={entries} variant={variant} />
    </TransactionDetailsWrapper>
  )
}
