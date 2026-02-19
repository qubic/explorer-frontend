import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Alert } from '@app/components/ui'
import { COPY_BUTTON_TYPES, CopyTextButton } from '@app/components/ui/buttons'
import { useGetAddressName } from '@app/hooks'
import { useGetSmartContractsQuery } from '@app/store/apis/qubic-static'
import type { QueryServiceTransaction } from '@app/store/apis/query-service'
import { clsxTwMerge, formatDate, formatHex, formatString } from '@app/utils'
import {
  buildContractAddressHints,
  decodeContractInputData
} from '@app/utils/contract-input-decoder'
import { getProcedureName } from '@app/utils/qubic'
import { type AssetTransfer, type Transfer, isSmartContractTx } from '@app/utils/qubic-ts'
import AddressLink from '../AddressLink'
import SubCardItem from '../SubCardItem'
import TickLink from '../TickLink'
import TxLink from '../TxLink'
import DecodedInputData from './DecodedInputData'
import TransferList from './TransferList/TransferList'
import type { TxItemVariant } from './TxItem.types'

type Props = {
  readonly txDetails: Omit<QueryServiceTransaction, 'inputSize' | 'moneyFlew' | 'timestamp'>
  readonly entries: Transfer[]
  readonly variant?: TxItemVariant
  readonly assetDetails?: AssetTransfer
  readonly timestamp?: string
  readonly showExtendedDetails?: boolean
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
  txDetails: { hash, source, tickNumber, destination, inputType, amount, inputData, signature },
  assetDetails,
  entries,
  timestamp,
  variant = 'primary',
  showExtendedDetails = false
}: Props) {
  const { t } = useTranslation('network-page')
  const { data: smartContracts } = useGetSmartContractsQuery()
  const [inputDataFormat, setInputDataFormat] = useState<'base64' | 'hex'>('hex')

  const isSecondaryVariant = variant === 'secondary'
  const { date, time } = useMemo(() => formatDate(timestamp, { split: true }), [timestamp])
  const inputDataHex = useMemo(() => formatHex(inputData), [inputData])

  const destAddress = assetDetails?.newOwnerAndPossessor ?? destination
  const sourceAddressNameData = useGetAddressName(source)
  const destinationAddressNameData = useGetAddressName(destAddress)

  const procedureName = useMemo(
    () => getProcedureName(destination, inputType, smartContracts),
    [destination, inputType, smartContracts]
  )
  const contractHints = useMemo(() => buildContractAddressHints(smartContracts), [smartContracts])
  const decodedInput = useMemo(
    () =>
      decodeContractInputData({
        inputType,
        inputData,
        destinationHint: destination,
        kindHint: 'procedure',
        contractHints
      }),
    [inputData, inputType, destination, contractHints]
  )

  const transactionTypeDisplay = useMemo(() => {
    const baseType = formatString(inputType)
    const txCategory = isSmartContractTx(destination, inputType) ? 'SC' : 'Standard'
    return procedureName
      ? `${baseType} ${txCategory} (${procedureName})`
      : `${baseType} ${txCategory}`
  }, [inputType, destination, procedureName])

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
          content={<TxLink className="text-sm text-primary-30" value={hash} copy />}
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
            label={sourceAddressNameData?.name}
            showTooltip={!!sourceAddressNameData?.name}
            value={source}
            copy
          />
        }
      />
      <SubCardItem
        title={t('destination')}
        variant={variant}
        content={
          <AddressLink
            label={destinationAddressNameData?.name}
            showTooltip={!!destinationAddressNameData?.name}
            value={assetDetails?.newOwnerAndPossessor ?? destination}
            copy
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

      {showExtendedDetails && signature && (
        <SubCardItem
          title={t('signature')}
          variant={variant}
          content={
            <div className="flex items-start gap-10">
              <p className="break-all font-space text-sm">{signature}</p>
              <CopyTextButton text={signature} type={COPY_BUTTON_TYPES.GENERIC} />
            </div>
          }
        />
      )}

      {showExtendedDetails && inputData && inputData.length > 0 && (
        <SubCardItem
          title={t('data')}
          variant={variant}
          content={
            <div className="min-w-0 flex-1">
              <p className="break-all rounded-8 bg-primary-60 p-12 font-space text-sm text-gray-50">
                <span className="float-right mb-4 ml-8 inline-flex overflow-hidden rounded-8 border border-gray-50 bg-primary-80">
                  {(['hex', 'base64'] as const).map((format, index) => (
                    <button
                      key={format}
                      type="button"
                      onClick={() => setInputDataFormat(format)}
                      className={clsxTwMerge(
                        'px-8 py-2 text-xs font-medium transition-colors',
                        index > 0 && 'border-l border-gray-50',
                        inputDataFormat === format
                          ? 'bg-primary-60 text-white'
                          : 'bg-transparent text-gray-50 hover:bg-primary-70 hover:text-white'
                      )}
                    >
                      {format === 'hex' ? 'Hex' : 'Base64'}
                    </button>
                  ))}
                </span>
                {inputDataFormat === 'hex' ? `0x${inputDataHex}` : inputData}
              </p>
            </div>
          }
        />
      )}
      {showExtendedDetails && inputData && inputData.length > 0 && inputType > 0 && (
        <SubCardItem
          title={t('decodedData')}
          variant={variant}
          content={<DecodedInputData decoded={decodedInput} t={t} />}
        />
      )}

      <TransferList entries={entries} variant={variant} />
    </TransactionDetailsWrapper>
  )
}
