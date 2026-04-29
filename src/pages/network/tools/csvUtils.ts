import type {
  ProcessedTickInterval,
  QueryServiceTransaction
} from '@app/store/apis/query-service/query-service.types'
import type { TransactionEvent } from '@app/store/apis/events'
import type { SmartContract, TransactionInputType } from '@app/store/apis/qubic-static'
import { getEpochForTick, isSendManyTx, isSimpleTransfer } from '@app/utils'
import { getTransactionTypeDisplay } from '@app/utils/qubic'

/** Formats epoch ms (string or number) or ISO string to DD.MM.YYYY  HH:mm:ss */
function formatCsvTimestamp(value: string | number): string {
  // Numeric epoch-ms strings need to be coerced to a number; new Date(numericString) returns Invalid Date.
  const parsed = typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : value
  const date = new Date(parsed)
  if (Number.isNaN(date.getTime())) return ''
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const yyyy = date.getFullYear()
  const hh = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  const ss = String(date.getSeconds()).padStart(2, '0')
  return `${dd}.${mm}.${yyyy}  ${hh}:${min}:${ss}`
}

function escapeCsvField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function toCsvRow(fields: string[]): string {
  return fields.map(escapeCsvField).join(',')
}

function getTxStatusLabel(
  inputType: number,
  amount: number,
  moneyFlew: boolean,
  destId: string
): string {
  if (!isSimpleTransfer(inputType, amount) && !isSendManyTx(destId, inputType)) {
    return 'Transaction executed'
  }
  return moneyFlew ? 'Successful transfer' : 'Transfer failed'
}

export function transactionsToCsv(
  transactions: QueryServiceTransaction[],
  protocolData?: TransactionInputType[],
  smartContracts?: SmartContract[],
  tickIntervals?: ProcessedTickInterval[]
): string {
  const header = toCsvRow([
    'Timestamp',
    'Tick',
    'TX ID',
    'Source',
    'Destination',
    'Amount',
    'Input Type',
    'Input Type Description',
    'Status'
  ])

  // Set of SC addresses that have a sharesAuctionEpoch — only these need epoch lookup
  const sharesAuctionAddresses = new Set(
    (smartContracts ?? []).filter((sc) => sc.sharesAuctionEpoch != null).map((sc) => sc.address)
  )
  // Lazy memoized epoch lookup — only invoked when needed and cached per tick
  const epochCache = new Map<number, number | undefined>()
  const lookupEpoch = (tickNumber: number): number | undefined => {
    if (!tickIntervals) return undefined
    if (epochCache.has(tickNumber)) return epochCache.get(tickNumber)
    const epoch = getEpochForTick(tickIntervals, tickNumber)
    epochCache.set(tickNumber, epoch)
    return epoch
  }

  const rows = transactions.map((tx) => {
    // Only compute epoch when both conditions for "Place Bid" detection are met
    const needsEpoch = tx.inputType === 1 && sharesAuctionAddresses.has(tx.destination)
    const epoch = needsEpoch ? lookupEpoch(tx.tickNumber) : undefined
    return toCsvRow([
      formatCsvTimestamp(tx.timestamp),
      String(tx.tickNumber),
      tx.hash,
      tx.source,
      tx.destination,
      tx.amount,
      String(tx.inputType),
      getTransactionTypeDisplay(tx.destination, tx.inputType, smartContracts, protocolData, epoch),
      getTxStatusLabel(tx.inputType, Number(tx.amount), tx.moneyFlew, tx.destination)
    ])
  })

  return [header, ...rows].join('\n')
}

export function eventsToCsv(events: TransactionEvent[]): string {
  const header = toCsvRow([
    'Timestamp',
    'Tick',
    'TX ID',
    'Source',
    'Destination',
    'Amount',
    'Asset'
  ])

  const rows = events.map((event) =>
    toCsvRow([
      formatCsvTimestamp(event.timestamp),
      String(event.tickNumber),
      event.transactionHash,
      event.source,
      event.destination,
      event.amount !== undefined ? String(event.amount) : '',
      event.assetName ?? 'QUBIC'
    ])
  )

  return [header, ...rows].join('\n')
}

export function downloadCsv(csvString: string, filename: string): void {
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 100)
}

export function buildCsvFilename(exportType: string, address: string): string {
  const shortAddr = `${address.slice(0, 4)}_${address.slice(-4)}`
  const date = new Date().toISOString().slice(0, 10)
  return `${exportType}_${shortAddr}_${date}.csv`
}
