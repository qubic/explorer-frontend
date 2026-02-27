import { memo, useMemo } from 'react'

import { Tooltip } from '@app/components/ui'
import type { QueryServiceTransaction } from '@app/store/apis/query-service'
import { useGetAddressName } from '@app/hooks'
import { useGetSmartContractsQuery } from '@app/store/apis/qubic-static'
import { formatDate, formatEllipsis, formatString } from '@app/utils'
import { getProcedureName } from '@app/utils/qubic'
import { isSmartContractTx } from '@app/utils/qubic-ts'
import AddressLink from './AddressLink'
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
  const sourceNameData = useGetAddressName(source)
  const destinationNameData = useGetAddressName(destination)

  const txStatus = useMemo(
    () => getTxStatus(inputType, Number(amount), moneyFlew, destination),
    [inputType, amount, moneyFlew, destination]
  )

  const procedureName = useMemo(
    () => getProcedureName(destination, inputType, smartContracts),
    [destination, inputType, smartContracts]
  )

  const typeDisplay = useMemo(
    () => procedureName || (isSmartContractTx(destination, inputType) ? 'SC' : 'Standard'),
    [inputType, destination, procedureName]
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
        <Tooltip tooltipId="tx-type" content={`${typeDisplay} (${inputType})`}>
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
        {highlightAddress === source ? (
          <Tooltip tooltipId="source-address" content={source}>
            <span className="font-space text-xs xs:text-sm">{formatEllipsis(source)}</span>
          </Tooltip>
        ) : (
          <AddressLink value={source} label={sourceNameData?.name} ellipsis showTooltip copy />
        )}
      </td>
      <td className="whitespace-nowrap px-8 py-12 sm:px-16">
        {highlightAddress === destination ? (
          <Tooltip tooltipId="destination-address" content={destination}>
            <span className="font-space text-xs xs:text-sm">{formatEllipsis(destination)}</span>
          </Tooltip>
        ) : (
          <AddressLink
            value={destination}
            label={destinationNameData?.name}
            ellipsis
            showTooltip
            copy
          />
        )}
      </td>
      <td className="whitespace-nowrap px-8 py-12 text-right font-space text-xs xs:text-sm sm:px-16">
        {formatString(amount)} <span className="text-gray-50">QUBIC</span>
      </td>
    </tr>
  )
}

const MemoizedTransactionRow = memo(TransactionRow)

export default MemoizedTransactionRow
