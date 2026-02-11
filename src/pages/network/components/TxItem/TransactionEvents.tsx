import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'

import { Badge, PaginationBar, Select, Skeleton, Tooltip } from '@app/components/ui'
import type { Option } from '@app/components/ui/Select'
import { DEFAULT_PAGE_SIZE, getPageSizeSelectOptions } from '@app/constants'
import { useGetAddressName } from '@app/hooks'
import { getEventTypeLabel, type TransactionEvent } from '@app/mocks/generateMockEvents'
import { formatDate, formatEllipsis, formatString } from '@app/utils'
import AddressLink from '../AddressLink'
import TickLink from '../TickLink'
import TxLink from '../TxLink'

const SKELETON_CELLS = [
  { id: 'id', className: 'h-16 w-32' },
  { id: 'type', className: 'h-16 w-64' },
  { id: 'source', className: 'h-16 w-80' },
  { id: 'destination', className: 'h-16 w-80' },
  { id: 'amount', className: 'ml-auto h-16 w-64' },
  { id: 'token', className: 'ml-auto h-16 w-48' }
]

const SKELETON_TICK_TIMESTAMP_CELLS = [
  { id: 'tick', className: 'h-16 w-64' },
  { id: 'timestamp', className: 'h-16 w-80' }
]

const SKELETON_TX_ID_CELL = { id: 'txId', className: 'h-16 w-80' }

type EventRowProps = {
  event: TransactionEvent
  showTickAndTimestamp: boolean
  showTxId: boolean
  highlightAddress?: string
}

function EventRow({ event, showTickAndTimestamp, showTxId, highlightAddress }: EventRowProps) {
  const sourceAddressName = useGetAddressName(event.source)
  const destinationAddressName = useGetAddressName(event.destination)

  return (
    <tr className="border-b-1 border-primary-60 last:border-b-0">
      <td className="px-16 py-14 font-space text-sm">{event.logId}</td>
      {showTickAndTimestamp && (
        <>
          <td className="px-16 py-14">
            {event.tickNumber && (
              <TickLink className="text-sm text-primary-30" value={event.tickNumber} />
            )}
          </td>
          <td className="whitespace-nowrap px-16 py-14 font-space text-sm text-gray-50">
            {formatDate(String(event.timestamp), { shortDate: true })}
          </td>
        </>
      )}
      {showTxId && (
        <td className="whitespace-nowrap px-16 py-14">
          <TxLink value={event.transactionHash} className="text-primary-30" ellipsis showTooltip />
        </td>
      )}
      <td className="px-16 py-14">
        <Badge color="primary" size="xs" className="text-gray-50">
          {getEventTypeLabel(event.type)}
        </Badge>
      </td>
      <td className="px-16 py-14">
        {highlightAddress === event.source ? (
          <Tooltip tooltipId="source-address" content={event.source}>
            <span className="font-space text-sm">{formatEllipsis(event.source)}</span>
          </Tooltip>
        ) : (
          <AddressLink value={event.source} label={sourceAddressName?.name} showTooltip ellipsis />
        )}
      </td>
      <td className="px-16 py-14">
        {highlightAddress === event.destination ? (
          <Tooltip tooltipId="destination-address" content={event.destination}>
            <span className="font-space text-sm">{formatEllipsis(event.destination)}</span>
          </Tooltip>
        ) : (
          <AddressLink
            value={event.destination}
            label={destinationAddressName?.name}
            showTooltip
            ellipsis
          />
        )}
      </td>
      <td className="px-16 py-14 text-right font-space text-sm font-500">
        {formatString(event.amount)}
      </td>
      <td className="px-16 py-14 text-right font-space text-sm">{event.assetName ?? 'QUBIC'}</td>
    </tr>
  )
}

type Props = {
  events: TransactionEvent[]
  isLoading?: boolean
  paginated?: boolean
  showTxId?: boolean
  showTickAndTimestamp?: boolean
  header?: string
  highlightAddress?: string
}

export default function TransactionEvents({
  events,
  isLoading = false,
  paginated = false,
  showTxId = true,
  showTickAndTimestamp = false,
  header,
  highlightAddress
}: Props) {
  const { t } = useTranslation('network-page')
  const [searchParams, setSearchParams] = useSearchParams()

  const page = paginated ? parseInt(searchParams.get('page') || '1', 10) : 1
  const pageSize = paginated
    ? parseInt(searchParams.get('pageSize') ?? String(DEFAULT_PAGE_SIZE), 10)
    : DEFAULT_PAGE_SIZE

  const pageSizeOptions = useMemo(() => getPageSizeSelectOptions(t), [t])
  const defaultPageSizeOption = useMemo(
    () => pageSizeOptions.find((option) => option.value === String(pageSize)),
    [pageSizeOptions, pageSize]
  )

  const pageCount = Math.ceil(events.length / pageSize)
  const displayEvents = paginated ? events.slice((page - 1) * pageSize, page * pageSize) : events

  const handlePageChange = useCallback(
    (value: number) => {
      setSearchParams((prev) => ({
        ...Object.fromEntries(prev.entries()),
        page: value.toString()
      }))
    },
    [setSearchParams]
  )

  const handlePageSizeChange = useCallback(
    (option: Option) => {
      setSearchParams((prev) => ({
        ...Object.fromEntries(prev.entries()),
        pageSize: option.value,
        page: '1'
      }))
    },
    [setSearchParams]
  )

  const columnCount = 6 + (showTickAndTimestamp ? 2 : 0) + (showTxId ? 1 : 0)

  const skeletonCells = [
    SKELETON_CELLS[0],
    ...(showTickAndTimestamp ? SKELETON_TICK_TIMESTAMP_CELLS : []),
    ...(showTxId ? [SKELETON_TX_ID_CELL] : []),
    ...SKELETON_CELLS.slice(1)
  ]

  return (
    <div className="flex flex-col gap-16">
      {header && <p className="font-space text-base font-500">{header}</p>}
      <div className="flex items-center gap-12 rounded-8 border-1 border-info-40/30 bg-info-90 px-16 py-14">
        <span className="shrink-0 rounded-4 border-1 border-info-40 px-8 py-2 font-space text-xs font-500 text-info-40">
          BETA
        </span>
        <p className="text-sm text-gray-50">{t('eventsBetaDisclaimer')}</p>
      </div>
      {paginated && (
        <div className="flex items-end justify-between">
          <span className="text-sm text-gray-50">
            {t('eventsFound', {
              count: events.length.toLocaleString()
            } as Record<string, string>)}
          </span>
          <Select
            className="w-[170px]"
            label={t('itemsPerPage')}
            defaultValue={defaultPageSizeOption}
            onSelect={handlePageSizeChange}
            options={pageSizeOptions}
          />
        </div>
      )}
      <div className="rounded-12 border-1 border-primary-60 bg-primary-70">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b-1 border-primary-60 text-left font-space text-sm text-gray-50">
              <tr>
                <th className="whitespace-nowrap px-16 py-12 font-400">{t('id')}</th>
                {showTickAndTimestamp && (
                  <>
                    <th className="whitespace-nowrap px-16 py-12 font-400">{t('tick')}</th>
                    <th className="whitespace-nowrap px-16 py-12 font-400">{t('timestamp')}</th>
                  </>
                )}
                {showTxId && (
                  <th className="whitespace-nowrap px-16 py-12 font-400">{t('txId')}</th>
                )}
                <th className="whitespace-nowrap px-16 py-12 font-400">{t('eventType')}</th>
                <th className="whitespace-nowrap px-16 py-12 font-400">{t('source')}</th>
                <th className="whitespace-nowrap px-16 py-12 font-400">{t('destination')}</th>
                <th className="whitespace-nowrap px-16 py-12 text-right font-400">{t('amount')}</th>
                <th className="whitespace-nowrap px-16 py-12 text-right font-400">{t('token')}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr
                    key={String(`skeleton-${i}`)}
                    className="border-b-1 border-primary-60 last:border-b-0"
                  >
                    {skeletonCells.map(({ id, className }) => (
                      <td key={id} className="px-16 py-14">
                        <Skeleton className={className} />
                      </td>
                    ))}
                  </tr>
                ))}
              {!isLoading && events.length === 0 && (
                <tr>
                  <td
                    colSpan={columnCount}
                    className="px-16 py-32 text-center text-sm text-gray-50"
                  >
                    {t('noEvents')}
                  </td>
                </tr>
              )}
              {!isLoading &&
                displayEvents.map((event) => (
                  <EventRow
                    key={event.logId}
                    event={event}
                    showTickAndTimestamp={showTickAndTimestamp}
                    showTxId={showTxId}
                    highlightAddress={highlightAddress}
                  />
                ))}
            </tbody>
          </table>
        </div>
        {paginated && pageCount > 1 && (
          <PaginationBar
            className="mx-auto w-fit gap-8 p-20"
            pageCount={pageCount}
            page={page}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  )
}
