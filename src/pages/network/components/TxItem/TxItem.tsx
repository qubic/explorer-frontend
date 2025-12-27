import { memo, useEffect, useMemo, useState } from 'react'

import { ArrowDownIcon, ArrowUpIcon } from '@app/assets/icons'
import { ChevronToggleButton } from '@app/components/ui/buttons'
import type { Transaction } from '@app/store/apis/archiver-v2'
import { formatString } from '@app/utils'
import { useGetAddressName } from '@app/hooks'
import type { AssetTransfer, Transfer } from '@app/utils/qubic-ts'
import { getAssetsTransfers, getTransfers, isSendManyTx, QX_ADDRESS } from '@app/utils/qubic-ts'
import AddressLink from '../AddressLink'
import CardItem from '../CardItem'
import TxLink from '../TxLink'
import TxStatus from '../TxStatus'
import { getTxStatus } from '../TxStatus.utils'
import TransactionDetails from './TransactionDetails'
import type { TxItemVariant } from './TxItem.types'

type Props = {
  readonly tx: Omit<Transaction['transaction'], 'inputSize' | 'signatureHex'>
  readonly identity?: string
  readonly nonExecutedTxIds: string[]
  readonly variant?: TxItemVariant
  readonly isHistoricalTx?: boolean
  readonly timestamp?: string
  readonly isExpanded?: boolean
  readonly onToggle?: (txId: string, isOpen: boolean) => void
}

function TxItem({
  tx: { txId, sourceId, tickNumber, destId, inputType, amount, inputHex },
  identity,
  nonExecutedTxIds,
  variant = 'primary',
  isHistoricalTx = false,
  timestamp,
  isExpanded,
  onToggle
}: Props) {
  const [entries, setEntries] = useState<Transfer[]>([])
  const [asset, setAsset] = useState<AssetTransfer>()
  const [internalDetailsOpen, setInternalDetailsOpen] = useState(false)

  // Use external control if provided, otherwise use internal state
  const detailsOpen = isExpanded !== undefined ? isExpanded : internalDetailsOpen

  const handleToggleDetails = () => {
    if (onToggle) {
      onToggle(txId, !detailsOpen)
    } else {
      setInternalDetailsOpen((prev) => !prev)
    }
  }

  const txStatus = useMemo(
    () =>
      getTxStatus(
        inputType,
        Number(amount),
        !(nonExecutedTxIds || []).includes(txId),
        sourceId,
        destId
      ),
    [inputType, amount, nonExecutedTxIds, txId, sourceId, destId]
  )

  const addressLabel = useMemo(() => {
    if (asset) {
      return asset.newOwnerAndPossessor
    }
    return identity === sourceId ? destId : sourceId
  }, [asset, identity, sourceId, destId])

  const addressNameData = useGetAddressName(addressLabel)
  const addressName = addressNameData?.name

  useEffect(() => {
    if (isSendManyTx(destId, inputType) && inputHex) {
      ;(async () => {
        try {
          const transfers = await getTransfers(inputHex)
          setEntries(transfers)
        } catch (error) {
          // eslint-disable-next-line no-console
          console.log(error)
        }
      })()
    }
    if (destId === QX_ADDRESS && inputType === 2 && inputHex) {
      ;(async () => {
        try {
          const assetTransfer = await getAssetsTransfers(inputHex)
          if (!assetTransfer) return
          setAsset(assetTransfer)
        } catch (error) {
          // eslint-disable-next-line no-console
          console.log(error)
        }
      })()
    }
  }, [destId, inputHex, inputType])

  if (variant === 'secondary') {
    return (
      <>
        <div className="mb-24 flex items-center gap-10 md:gap-16">
          <TxStatus status={txStatus} />
          <TxLink
            isHistoricalTx={isHistoricalTx}
            className="text-base text-gray-50"
            value={txId}
            copy
          />
        </div>
        <TransactionDetails
          txDetails={{ txId, sourceId, tickNumber, destId, inputType, amount }}
          isHistoricalTx={isHistoricalTx}
          variant={variant}
          entries={entries}
          assetDetails={asset}
          timestamp={timestamp}
        />
      </>
    )
  }

  return (
    <CardItem className="flex flex-col rounded-12 p-12 transition-all duration-300">
      <div className="flex items-center justify-between gap-8">
        <TxStatus status={txStatus} />
        <div className="flex flex-grow flex-col items-start gap-8 sm:flex-row sm:items-center sm:justify-between">
          {identity ? (
            <div className="flex items-center gap-8">
              {identity === sourceId ? (
                <ArrowUpIcon className="size-12 text-error-30" />
              ) : (
                <ArrowDownIcon className="size-12 text-success-30" />
              )}
              <AddressLink
                className="text-base"
                label={addressName}
                value={addressLabel}
                showTooltip
                copy
                ellipsis
              />
            </div>
          ) : (
            <TxLink
              isHistoricalTx={isHistoricalTx}
              value={txId}
              className="text-primary-30"
              showTooltip
              ellipsis
              copy
            />
          )}
          <p className="text-center font-space text-base">
            {asset ? (
              <>
                {formatString(asset.units)} <span className="text-gray-50">{asset.assetName}</span>
              </>
            ) : (
              <>
                {formatString(amount)} <span className="text-gray-50">QUBIC</span>
              </>
            )}
          </p>
        </div>
        <ChevronToggleButton
          aria-label="toggle-tx-details"
          isOpen={detailsOpen}
          onClick={handleToggleDetails}
        />
      </div>
      {detailsOpen && (
        <TransactionDetails
          txDetails={{ txId, sourceId, tickNumber, destId, inputType, amount }}
          isHistoricalTx={isHistoricalTx}
          variant={variant}
          entries={entries}
          assetDetails={asset}
          timestamp={timestamp}
        />
      )}
    </CardItem>
  )
}

const MemoizedTxItem = memo(TxItem)

export default MemoizedTxItem
