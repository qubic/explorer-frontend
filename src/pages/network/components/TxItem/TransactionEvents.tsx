import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'

import { Badge, PaginationBar, Select } from '@app/components/ui'
import type { Option } from '@app/components/ui/Select'
import { DEFAULT_PAGE_SIZE, getPageSizeSelectOptions } from '@app/constants'
import type { TransactionEvent } from '@app/mocks/generateMockEvents'
import { formatDate, formatEllipsis, formatString } from '@app/utils'
import AddressLink from '../AddressLink'
import TickLink from '../TickLink'
import TxLink from '../TxLink'

type Props = {
  events: TransactionEvent[]
  paginated?: boolean
  showTxId?: boolean
  showTickAndTimestamp?: boolean
  header?: string
  highlightAddress?: string
}

export default function TransactionEvents({
  events,
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

  if (events.length === 0) {
    return <p className="py-32 text-center text-sm text-gray-50">{t('noEvents')}</p>
  }

  return (
    <div className="flex flex-col gap-16">
      {header && <p className="font-space text-base font-500">{header}</p>}
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
            <thead className="border-b-1 border-t-1 border-primary-60 bg-primary-80/50">
              <tr>
                <th className="px-16 py-12 text-left font-space text-xs font-400 text-gray-50">
                  {t('id')}
                </th>
                {showTickAndTimestamp && (
                  <>
                    <th className="px-16 py-12 text-left font-space text-xs font-400 text-gray-50">
                      {t('tick')}
                    </th>
                    <th className="px-16 py-12 text-left font-space text-xs font-400 text-gray-50">
                      {t('timestamp')}
                    </th>
                  </>
                )}
                {showTxId && (
                  <th className="px-16 py-12 text-left font-space text-xs font-400 text-gray-50">
                    {t('txId')}
                  </th>
                )}
                <th className="px-16 py-12 text-left font-space text-xs font-400 text-gray-50">
                  {t('type')}
                </th>
                <th className="px-16 py-12 text-left font-space text-xs font-400 text-gray-50">
                  {t('source')}
                </th>
                <th className="px-16 py-12 text-left font-space text-xs font-400 text-gray-50">
                  {t('destination')}
                </th>
                <th className="px-16 py-12 text-right font-space text-xs font-400 text-gray-50">
                  {t('amount')}
                </th>
                <th className="px-16 py-12 text-right font-space text-xs font-400 text-gray-50">
                  {t('token')}
                </th>
              </tr>
            </thead>
            <tbody>
              {displayEvents.map((event) => (
                <tr key={event.id} className="border-b-1 border-primary-60 last:border-b-0">
                  <td className="px-16 py-14 font-space text-sm">{event.id}</td>
                  {showTickAndTimestamp && (
                    <>
                      <td className="px-16 py-14">
                        {event.tick && (
                          <TickLink className="text-sm text-primary-30" value={event.tick} />
                        )}
                      </td>
                      <td className="whitespace-nowrap px-16 py-14 font-space text-sm text-gray-50">
                        {formatDate(event.timestamp, { shortDate: true })}
                      </td>
                    </>
                  )}
                  {showTxId && (
                    <td className="px-16 py-14">
                      <TxLink value={event.txId} className="text-primary-30" ellipsis showTooltip />
                    </td>
                  )}
                  <td className="px-16 py-14">
                    <Badge color="primary" size="xs" className="text-gray-50">
                      {event.type}
                    </Badge>
                  </td>
                  <td className="px-16 py-14">
                    {highlightAddress === event.source ? (
                      <span className="font-space text-sm">{formatEllipsis(event.source)}</span>
                    ) : (
                      <AddressLink value={event.source} ellipsis showTooltip />
                    )}
                  </td>
                  <td className="px-16 py-14">
                    {highlightAddress === event.destination ? (
                      <span className="font-space text-sm">
                        {formatEllipsis(event.destination)}
                      </span>
                    ) : (
                      <AddressLink value={event.destination} ellipsis showTooltip />
                    )}
                  </td>
                  <td className="px-16 py-14 text-right font-space text-sm font-500">
                    {formatString(event.amount)}
                  </td>
                  <td className="px-16 py-14 text-right font-space text-sm">{event.token}</td>
                </tr>
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
