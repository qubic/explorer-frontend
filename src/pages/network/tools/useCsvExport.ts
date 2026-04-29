import { useCallback, useState } from 'react'

import {
  useGetProcessedTickIntervalsQuery,
  useGetTransactionsForIdentityMutation
} from '@app/store/apis/query-service/query-service.api'
import { useFetchEventsMutation } from '@app/store/apis/events'
import type { EventRange, ShouldFilter } from '@app/store/apis/events'
import { useGetProtocolQuery, useGetSmartContractsQuery } from '@app/store/apis/qubic-static'
import { extractErrorMessage } from '../utils/filterUtils'
import { buildCsvFilename, downloadCsv, eventsToCsv, transactionsToCsv } from './csvUtils'

export type ExportType = 'transactions' | 'qubicTransfers' | 'tokenTransfers'
export type RangeType = 'date' | 'tick'

export interface CsvExportParams {
  exportType: ExportType
  address: string
  rangeType: RangeType
  startDate?: string
  endDate?: string
  startTick?: string
  endTick?: string
}

export const CSV_PAGE_SIZE = 1000
export const EVENTS_DATA_START_TICK = 48_160_000
export const EVENTS_DATA_START_DATE = '2026-04-01'

function buildTimestampRange(
  startDate: string | undefined,
  endDate: string | undefined
): EventRange | undefined {
  if (!startDate && !endDate) return undefined
  return {
    ...(startDate && { gte: new Date(`${startDate}T00:00:00.000Z`).getTime().toString() }),
    ...(endDate && { lte: new Date(`${endDate}T23:59:59.999Z`).getTime().toString() })
  }
}

function buildTickRange(
  startTick: string | undefined,
  endTick: string | undefined
): EventRange | undefined {
  if (!startTick && !endTick) return undefined
  return {
    ...(startTick && { gte: startTick }),
    ...(endTick && { lte: endTick })
  }
}

export default function useCsvExport() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [getTransactionsForIdentity] = useGetTransactionsForIdentityMutation()
  const [getEvents] = useFetchEventsMutation()
  const { data: protocolData } = useGetProtocolQuery()
  const { data: smartContracts } = useGetSmartContractsQuery()
  const { data: tickIntervals } = useGetProcessedTickIntervalsQuery()

  const download = useCallback(
    async (params: CsvExportParams) => {
      setError(null)
      setIsLoading(true)

      try {
        const { exportType, address, rangeType, startDate, endDate, startTick, endTick } = params

        const tickRange = rangeType === 'tick' ? buildTickRange(startTick, endTick) : undefined
        const timestampRange =
          rangeType === 'date' ? buildTimestampRange(startDate, endDate) : undefined

        if (exportType === 'transactions') {
          const ranges: Record<string, { gte?: string; lte?: string }> = {}
          if (tickRange) ranges.tickNumber = tickRange
          if (timestampRange) ranges.timestamp = timestampRange

          const result = await getTransactionsForIdentity({
            identity: address,
            ranges: Object.keys(ranges).length > 0 ? ranges : undefined,
            pagination: { offset: 0, size: CSV_PAGE_SIZE }
          }).unwrap()

          const transactions = result?.transactions ?? []
          if (transactions.length === 0) {
            setError('csvExportNoData')
            return
          }

          const csv = transactionsToCsv(transactions, protocolData, smartContracts, tickIntervals)
          downloadCsv(csv, buildCsvFilename('transactions', address))
        } else {
          // QUBIC Transfers (logType 0) or Token Transfers (logType 3)
          const logType = exportType === 'qubicTransfers' ? [0] : [3]
          const should: ShouldFilter[] = [{ terms: { source: address, destination: address } }]

          const result = await getEvents({
            logType,
            should,
            tickRange,
            timestampRange,
            offset: 0,
            size: CSV_PAGE_SIZE
          }).unwrap()

          if (result.events.length === 0) {
            setError('csvExportNoData')
            return
          }

          const csv = eventsToCsv(result.events)
          const typeLabel = exportType === 'qubicTransfers' ? 'qubic_transfers' : 'token_transfers'
          downloadCsv(csv, buildCsvFilename(typeLabel, address))
        }
      } catch (err) {
        const serverMessage = extractErrorMessage(err)
        setError(serverMessage || 'csvExportError')
        // eslint-disable-next-line no-console
        console.error('CSV export failed:', err)
      } finally {
        setIsLoading(false)
      }
    },
    [getTransactionsForIdentity, getEvents, protocolData, smartContracts, tickIntervals]
  )

  const reset = useCallback(() => {
    setError(null)
  }, [])

  return { download, isLoading, error, reset }
}
