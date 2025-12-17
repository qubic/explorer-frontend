import { useTranslation } from 'react-i18next'

import { Alert } from '@app/components/ui'
import { CopyTextButton, COPY_BUTTON_TYPES } from '@app/components/ui/buttons'
import { useGetAddressName } from '@app/hooks'
import type { Transaction } from '@app/store/apis/archiver-v2/archiver-v2.types'
import { useGetSmartContractsQuery } from '@app/store/apis/qubic-static'
import { clsxTwMerge, formatDate, formatString } from '@app/utils'
import {
  decodeTransactionInputData,
  getProcedureName,
  type DecodedInputData
} from '@app/utils/qubic'
import { type AssetTransfer, type Transfer, isSmartContractTx } from '@app/utils/qubic-ts'
import { useEffect, useMemo, useState } from 'react'
import AddressLink from '../AddressLink'
import SubCardItem from '../SubCardItem'
import TickLink from '../TickLink'
import TxLink from '../TxLink'
import TransferList from './TransferList/TransferList'
import type { TxItemVariant } from './TxItem.types'

type Props = {
  readonly txDetails: Omit<Transaction['transaction'], 'inputSize' | 'signatureHex'>
  readonly entries: Transfer[]
  readonly isHistoricalTx?: boolean
  readonly variant?: TxItemVariant
  readonly assetDetails?: AssetTransfer
  readonly timestamp?: string
}

const formatDecodedFieldValue = (value: unknown): string => {
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (typeof value === 'bigint') return value.toString()
  if (value === null || value === undefined) return ''
  return JSON.stringify(value)
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
  txDetails: { txId, sourceId, tickNumber, destId, inputType, amount, inputHex },
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
  const [decodedInputData, setDecodedInputData] = useState<DecodedInputData | null>(null)
  const [inputDisplayMode, setInputDisplayMode] = useState<'json' | 'table'>('table')

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

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      const result = await decodeTransactionInputData({
        inputHex,
        inputType,
        destId,
        smartContracts
      })
      if (isMounted) {
        setDecodedInputData(result)
      }
    })()

    return () => {
      isMounted = false
    }
  }, [destId, inputHex, inputType, smartContracts])

  const inputDataEntries = useMemo(() => {
    if (!decodedInputData?.decoded) return []

    return Object.entries(decodedInputData.decoded).map(([key, value]) => ({
      key,
      value: formatDecodedFieldValue(value)
    }))
  }, [decodedInputData])

  const inputDataJson = useMemo(() => {
    if (!inputDataEntries.length) return null
    const normalized = Object.fromEntries(inputDataEntries.map(({ key, value }) => [key, value]))
    return JSON.stringify(normalized, null, 2)
  }, [inputDataEntries])

  const renderInputDataContent = () => {
    if (!inputDataJson || variant !== 'secondary') return null

    const header = (
      <div className="flex flex-wrap items-center justify-between gap-12">
        <p className="text-gray-10 font-space text-base">{t('inputData')}</p>
        <div className="flex items-center gap-8 text-xs uppercase">
          <button
            type="button"
            className={clsxTwMerge(
              'rounded-6 border-1 px-10 py-4 tracking-wide',
              inputDisplayMode === 'json'
                ? 'text-primary-10 border-primary-30'
                : 'border-transparent text-gray-50 hover:text-white'
            )}
            onClick={() => setInputDisplayMode('json')}
          >
            {t('inputDataViewJson')}
          </button>
          <button
            type="button"
            className={clsxTwMerge(
              'rounded-6 border-1 px-10 py-4 tracking-wide',
              inputDisplayMode === 'table'
                ? 'text-primary-10 border-primary-30'
                : 'border-transparent text-gray-50 hover:text-white'
            )}
            onClick={() => setInputDisplayMode('table')}
          >
            {t('inputDataViewTable')}
          </button>
        </div>
      </div>
    )

    const jsonView = (
      <div className="bg-primary-90/30 relative rounded-12 border-1 border-primary-60 p-16">
        <div className="absolute right-16 top-16">
          <CopyTextButton text={inputDataJson} type={COPY_BUTTON_TYPES.GENERIC} />
        </div>
        <pre className="text-primary-10 overflow-x-auto whitespace-pre-wrap break-words bg-transparent pr-40 font-mono text-xs">
          {inputDataJson}
        </pre>
      </div>
    )

    const tableView = (
      <div className="overflow-hidden rounded-12 border-1 border-primary-60">
        <table className="w-full table-fixed border-collapse">
          <tbody>
            {inputDataEntries.map(({ key, value }) => (
              <tr key={`${key}-${value}`} className="border-b-1 border-primary-60 last:border-b-0">
                <td className="text-gray-20 w-1/3 bg-primary-70 px-12 py-10 align-top font-space text-xs uppercase">
                  {key}
                </td>
                <td className="px-12 py-10 align-top">
                  <div className="flex items-center gap-8">
                    <span className="text-gray-30 flex-1 truncate font-space text-sm" title={value}>
                      {value}
                    </span>
                    <CopyTextButton text={value} type={COPY_BUTTON_TYPES.GENERIC} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )

    const body = (
      <div className="flex flex-col gap-16">
        {header}
        {inputDisplayMode === 'json' ? jsonView : tableView}
      </div>
    )

    return <div className="flex flex-col gap-16 border-t-1 border-primary-60 pt-16">{body}</div>
  }

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
            label={sourceAddressNameData?.name}
            showTooltip={!!sourceAddressNameData?.name}
            value={sourceId}
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
            value={assetDetails?.newOwnerAndPossessor ?? destId}
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

      {renderInputDataContent()}

      <TransferList entries={entries} variant={variant} />
    </TransactionDetailsWrapper>
  )
}
