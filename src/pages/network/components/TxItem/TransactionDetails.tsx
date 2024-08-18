import { useTranslation } from 'react-i18next'

import type { Transaction } from '@app/services/archiver'
import { formatString } from '@app/utils'
import type { Transfer } from '@app/utils/qubic-ts'
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
  entries,
  isHistoricalTx = false,
  variant = 'primary'
}: Props) {
  const { t } = useTranslation('network-page')

  const isSecondaryVariant = variant === 'secondary'

  return (
    <TransactionDetailsWrapper variant={variant}>
      {isSecondaryVariant ? (
        <SubCardItem
          variant="secondary"
          title={t('amount')}
          content={<p className="font-space text-14 leading-20">{formatString(amount)} QUBIC</p>}
        />
      ) : (
        <SubCardItem
          title={`TX ${t('id')}`}
          variant={variant}
          content={
            <TxLink
              isHistoricalTx={isHistoricalTx}
              className="text-14 text-primary-30"
              value={txId}
              copy
            />
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
      <SubCardItem
        title={t('type')}
        variant={variant}
        content={
          <p className="font-space text-14 leading-18">
            {formatString(inputType)} {inputType === 0 ? 'Standard' : 'SC'}
          </p>
        }
      />

      <TransferList entries={entries} variant={variant} />
    </TransactionDetailsWrapper>
  )
}
