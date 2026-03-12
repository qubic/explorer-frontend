import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import { Infocon } from '@app/assets/icons'
import { Badge, PageSizeSelect, PaginationBar, Skeleton, Tooltip } from '@app/components/ui'
import {
  useGetAddressName,
  useGetSmartContractByIndex,
  usePaginationSearchParams,
  useValidatedPage,
  useValidatedPageSize
} from '@app/hooks'
import { EVENT_TYPES, getEventTypeLabel, type TransactionEvent } from '@app/store/apis/events'
import { formatDate, formatString } from '@app/utils'
import AddressCell from '../AddressCell'
import BetaBanner from '../BetaBanner'
import EventLink from '../EventLink'
import TickLink from '../TickLink'
import TxLink from '../TxLink'
import VirtualTxLink from '../VirtualTxLink'

const MAX_EVENT_RESULTS = 10_000

const SKELETON_CELLS = [
  { id: 'id', className: 'h-16 w-32' },
  { id: 'type', className: 'h-16 w-64' },
  { id: 'source', className: 'h-16 w-80' },
  { id: 'destination', className: 'h-16 w-80' },
  { id: 'amount', className: 'ml-auto h-16 w-80' }
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

const EventRow = memo(function EventRow({
  event,
  showTickAndTimestamp,
  showTxId,
  highlightAddress
}: EventRowProps) {
  const contract = useGetSmartContractByIndex(
    event.type === EVENT_TYPES.CONTRACT_RESERVE_DEDUCTION && !event.source
      ? event.contractIndex
      : undefined
  )

  const source = contract?.address ?? event.source

  const sourceAddressName = useGetAddressName(source)
  const destinationAddressName = useGetAddressName(event.destination)

  return (
    <tr className="border-b-1 border-primary-60 last:border-b-0">
      <td className="px-16 py-14">
        <EventLink tickNumber={event.tickNumber} logId={event.logId} />
      </td>
      {showTickAndTimestamp && (
        <>
          <td className="px-16 py-14">
            {event.tickNumber > 0 && (
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
          {event.isVirtualTx ? (
            <VirtualTxLink value={event.transactionHash} />
          ) : (
            <TxLink
              value={event.transactionHash}
              className="text-primary-30"
              copy
              ellipsis
              showTooltip
            />
          )}
        </td>
      )}
      <td className="px-16 py-14">
        <Badge color="primary" size="xs" className="text-gray-50">
          {getEventTypeLabel(event.type)}
        </Badge>
      </td>
      <td className="px-16 py-14">
        <AddressCell
          address={source}
          highlightAddress={highlightAddress}
          addressName={sourceAddressName?.name}
          tooltipId="source-address"
          showDash
        />
      </td>
      <td className="px-16 py-14">
        <AddressCell
          address={event.destination}
          highlightAddress={highlightAddress}
          addressName={destinationAddressName?.name}
          tooltipId="destination-address"
          showDash
        />
      </td>
      <td className="whitespace-nowrap px-16 py-14 text-right font-space text-sm">
        <span className="font-500">{formatString(event.amount)}</span>{' '}
        <span className="text-gray-50">{event.assetName ?? 'QUBIC'}</span>
      </td>
    </tr>
  )
})

type Props = {
  events: TransactionEvent[]
  total?: number
  isLoading?: boolean
  paginated?: boolean
  showTxId?: boolean
  showTickAndTimestamp?: boolean
  showBetaBanner?: boolean
  header?: string
  highlightAddress?: string
}

export default function TransactionEvents({
  events,
  total,
  isLoading = false,
  paginated = false,
  showTxId = true,
  showTickAndTimestamp = false,
  showBetaBanner = true,
  header,
  highlightAddress
}: Props) {
  const { t } = useTranslation('network-page')
  const { handlePageChange, handlePageSizeChange } = usePaginationSearchParams()

  const page = useValidatedPage(paginated)
  const pageSize = useValidatedPageSize(paginated)

  // When total is provided, pagination is server-side (events already paginated)
  const totalCount = total ?? events.length
  const pageCount = Math.ceil(totalCount / pageSize)
  const displayEvents =
    paginated && total === undefined ? events.slice((page - 1) * pageSize, page * pageSize) : events

  const columnCount = 5 + (showTickAndTimestamp ? 2 : 0) + (showTxId ? 1 : 0)

  const skeletonCells = [
    SKELETON_CELLS[0],
    ...(showTickAndTimestamp ? SKELETON_TICK_TIMESTAMP_CELLS : []),
    ...(showTxId ? [SKELETON_TX_ID_CELL] : []),
    ...SKELETON_CELLS.slice(1)
  ]

  return (
    <div className="flex flex-col gap-16">
      {header && <p className="font-space text-base font-500">{header}</p>}
      {showBetaBanner && <BetaBanner />}
      {paginated && (
        <div className="flex flex-wrap items-center justify-between gap-8">
          {!isLoading && totalCount > 0 ? (
            <div className="flex items-center text-sm text-gray-50">
              {totalCount >= MAX_EVENT_RESULTS ? (
                <>
                  <span>
                    {t('showingMaxEvents', {
                      count: MAX_EVENT_RESULTS.toLocaleString()
                    } as Record<string, string>)}
                  </span>
                  <Tooltip
                    tooltipId="max-events-info"
                    content={t('maxResultsHint', {
                      count: MAX_EVENT_RESULTS.toLocaleString()
                    } as Record<string, string>)}
                  >
                    <Infocon className="ml-6 h-16 w-16 cursor-help text-gray-50" />
                  </Tooltip>
                </>
              ) : (
                <span>
                  {t('eventsFound', {
                    count: totalCount.toLocaleString()
                  } as Record<string, string>)}
                </span>
              )}
            </div>
          ) : (
            <span />
          )}
          <PageSizeSelect pageSize={pageSize} onSelect={handlePageSizeChange} />
        </div>
      )}
      <div className="rounded-12 border-1 border-primary-60 bg-primary-70">
        <div className="overflow-x-auto">
          <table className="w-full" aria-label={header || t('events')}>
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
                  <th className="whitespace-nowrap px-16 py-12 font-400">{t('txID')}</th>
                )}
                <th className="whitespace-nowrap px-16 py-12 font-400">{t('eventType')}</th>
                <th className="whitespace-nowrap px-16 py-12 font-400">{t('source')}</th>
                <th className="whitespace-nowrap px-16 py-12 font-400">{t('destination')}</th>
                <th className="whitespace-nowrap px-16 py-12 text-right font-400">{t('amount')}</th>
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
              {!isLoading && displayEvents.length === 0 && (
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
                    key={`${event.transactionHash}-${event.logId}`}
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
