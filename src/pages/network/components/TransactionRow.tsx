import { memo, useMemo } from 'react'

import { Tooltip } from '@app/components/ui'
import type { QueryServiceTransaction } from '@app/store/apis/query-service'
import { useGetAddressName, useGetEpochForTick } from '@app/hooks'
import { useGetProtocolQuery, useGetSmartContractsQuery } from '@app/store/apis/qubic-static'
import { formatDate, formatString } from '@app/utils'
import { getTransactionTypeDisplay, getTransactionTypeDisplayLong } from '@app/utils/qubic'
import AddressCell from './AddressCell'
import TickLink from './TickLink'
import TxLink from './TxLink'
import TxStatus from './TxStatus'
import { getTxStatus } from './TxStatus.utils'

type Props = {
  tx: QueryServiceTransaction
  highlightTick?: number
  highlightAddress?: string
}

function TransactionRow({ tx, highlightTick, highlightAddress }: Props) {
  const { hash, source, destination, amount, inputType, tickNumber, timestamp, moneyFlew } = tx

  const { data: smartContracts } = useGetSmartContractsQuery()
  const { data: protocolData } = useGetProtocolQuery()
  const { epoch } = useGetEpochForTick(tickNumber)
  const sourceNameData = useGetAddressName(source)
  const destinationNameData = useGetAddressName(destination)

  const txStatus = useMemo(
    () => getTxStatus(inputType, Number(amount), moneyFlew, destination),
    [inputType, amount, moneyFlew, destination]
  )

  const typeDisplay = useMemo(
    () => getTransactionTypeDisplay(destination, inputType, smartContracts, protocolData, epoch),
    [destination, inputType, smartContracts, protocolData, epoch]
  )

  return (
    <tr className="border-b border-primary-60">
      <td className="px-8 py-12 sm:px-16">
        <div className="flex justify-center">
          <TxStatus status={txStatus} />
        </div>
      </td>
      <td className="whitespace-nowrap px-8 py-12 sm:px-16">
        <TxLink value={hash} className="text-primary-30" ellipsis showTooltip copy />
      </td>
      <td className="whitespace-nowrap px-8 py-12 font-space text-xs xs:text-sm sm:px-16">
        <Tooltip
          tooltipId="tx-type"
          content={getTransactionTypeDisplayLong(
            destination,
            inputType,
            smartContracts,
            protocolData,
            epoch
          )}
        >
          <span className="block max-w-[120px] truncate">{typeDisplay}</span>
        </Tooltip>
      </td>
      <td className="whitespace-nowrap px-8 py-12 sm:px-16">
        {highlightTick === Number(tickNumber) ? (
          <span className="font-space text-xs xs:text-sm">{formatString(tickNumber)}</span>
        ) : (
          <TickLink value={Number(tickNumber)} className="text-xs text-primary-30 xs:text-sm" />
        )}
      </td>
      <td className="whitespace-nowrap px-8 py-12 font-space text-xs text-gray-50 xs:text-sm sm:px-16">
        {formatDate(timestamp, { shortDate: true }) || '-'}
      </td>
      <td className="whitespace-nowrap px-8 py-12 sm:px-16">
        <AddressCell
          address={source}
          highlightAddress={highlightAddress}
          addressName={sourceNameData?.name}
          tooltipId="source-address"
          textClassName="font-space text-xs xs:text-sm"
        />
      </td>
      <td className="whitespace-nowrap px-8 py-12 sm:px-16">
        <AddressCell
          address={destination}
          highlightAddress={highlightAddress}
          addressName={destinationNameData?.name}
          tooltipId="destination-address"
          textClassName="font-space text-xs xs:text-sm"
        />
      </td>
      <td className="whitespace-nowrap px-8 py-12 text-right font-space text-xs xs:text-sm sm:px-16">
        {formatString(amount)} <span className="text-gray-50">QUBIC</span>
      </td>
    </tr>
  )
}

const MemoizedTransactionRow = memo(TransactionRow)

export default MemoizedTransactionRow
