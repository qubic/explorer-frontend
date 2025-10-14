import { useTranslation } from 'react-i18next'

import { Alert } from '@app/components/ui'
import type { Transaction } from '@app/store/apis/archiver-v2/archiver-v2.types'
import { useGetSmartContractsQuery } from '@app/store/apis/qubic-static'
import { clsxTwMerge, formatDate, formatString } from '@app/utils'
import { getProcedureName } from '@app/utils/qubic'
import { useGetAddressName } from '@app/hooks'
import { type AssetTransfer, type Transfer, isSmartContractTx } from '@app/utils/qubic-ts'
import { useMemo } from 'react'
import AddressLink from '../AddressLink'
import SubCardItem from '../SubCardItem'
import TickLink from '../TickLink'
import TxLink from '../TxLink'
import TransferList from './TransferList/TransferList'
import type { TxItemVariant } from './TxItem.types'

type Props = {
  readonly txDetails: Omit<Transaction['transaction'], 'inputSize' | 'signatureHex' | 'inputHex'>
  readonly entries: Transfer[]
  readonly isHistoricalTx?: boolean
  readonly variant?: TxItemVariant
  readonly assetDetails?: AssetTransfer
  readonly timestamp?: string
}

function TransactionDetailsWrapper({
  children,
  variant
}: {
  readonly children: React.ReactNode
  readonly variant: TxItemVariant
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
  const { data: smartContracts } = useGetSmartContractsQuery()

  const isSecondaryVariant = variant === 'secondary'
  const { date, time } = useMemo(() => formatDate(timestamp, { split: true }), [timestamp])

  const destAddress = assetDetails?.newOwnerAndPossessor ?? destId
  const sourceAddressNameData = useGetAddressName(sourceId)
  const destinationAddressNameData = useGetAddressName(destAddress)

  // Check if addresses are smart contracts (prioritize SC names over token names)
  const sourceSmartContract = useMemo(
    () => smartContracts?.find((sc) => sc.address === sourceId),
    [smartContracts, sourceId]
  )
  const destSmartContract = useMemo(
    () => smartContracts?.find((sc) => sc.address === destAddress),
    [smartContracts, destAddress]
  )

  // Prioritize smart contract name, then token/exchange/label name
  const sourceAddressName = sourceSmartContract?.name ?? sourceAddressNameData?.name
  const destinationAddressName = destSmartContract?.name ?? destinationAddressNameData?.name

  const procedureName = useMemo(
    () => getProcedureName(destId, inputType, smartContracts),
    [destId, inputType, smartContracts]
  )

  const transactionTypeDisplay = useMemo(() => {
    const baseType = formatString(inputType)
    const txCategory = isSmartContractTx(destId, inputType) ? 'SC' : 'Standard'
    return procedureName
      ? `${baseType} ${txCategory} (${procedureName})`
      : `${baseType} ${txCategory}`
  }, [inputType, destId, procedureName])

  return (
    <TransactionDetailsWrapper variant={variant}>
      {assetDetails && (
        <Alert size="sm" className={clsxTwMerge(variant === 'secondary' && 'mb-24')}>
          {t('assetTransferWarning')}
        </Alert>
      )}
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
          content={<p className="font-space text-sm">{transactionTypeDisplay}</p>}
        />
      )}

      <SubCardItem
        title={t('source')}
        variant={variant}
        content={
          <AddressLink
            label={sourceAddressName}
            showTooltip={!!sourceAddressName}
            value={sourceId}
            copy={isSecondaryVariant}
          />
        }
      />
      <SubCardItem
        title={t('destination')}
        variant={variant}
        content={
          <AddressLink
            label={destinationAddressName}
            showTooltip={!!destinationAddressName}
            value={assetDetails?.newOwnerAndPossessor ?? destId}
            copy={isSecondaryVariant}
          />
        }
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
          content={<p className="font-space text-sm">{transactionTypeDisplay}</p>}
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
