import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'

import { ArrowLeftIcon } from '@app/assets/icons'
import { PageSizeSelect, PaginationBar, Skeleton } from '@app/components/ui'
import {
  useGetAddressName,
  usePageAutoCorrect,
  usePaginationSearchParams,
  useValidatedPage,
  useValidatedPageSize
} from '@app/hooks'
import type { SmartContractRewardDistribution } from '@app/store/apis/aggregation'
import { useGetEventsQuery } from '@app/store/apis/events'
import { formatString } from '@app/utils'
import { CardItem, EventLink, TickLink } from '../../components'
import AddressCell from '../../components/AddressCell'
import BetaBanner from '../../components/BetaBanner'

// IN_DIVIDEND_SECTION — scopes to QU_TRANSFER events emitted as part of dividend distribution.
const DIVIDEND_CATEGORY = 7
const QU_TRANSFER = 0

const SKELETON_ROW_COUNT = 5

const SKELETON_CELL_ID = {
  ID: 'id',
  DESTINATION: 'destination',
  AMOUNT: 'amount',
  TIMESTAMP: 'timestamp'
}

const SKELETON_CELLS = [
  { id: SKELETON_CELL_ID.ID, className: 'h-16 w-32' },
  { id: SKELETON_CELL_ID.DESTINATION, className: 'h-16 w-80' },
  { id: SKELETON_CELL_ID.AMOUNT, className: 'ml-auto h-16 w-80' },
  { id: SKELETON_CELL_ID.TIMESTAMP, className: 'ml-auto h-16 w-80' }
]

function formatTimestamp(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return '-'
  return new Date(ms).toLocaleString()
}

function DestinationCell({ address }: { address: string }) {
  const addressName = useGetAddressName(address)
  return (
    <AddressCell
      address={address}
      addressName={addressName?.name}
      tooltipId={`reward-dest-${address.slice(0, 8)}`}
    />
  )
}

type Props = Readonly<{
  smartContractAddress: string
  tickNumber: number
  distribution?: SmartContractRewardDistribution
}>

export default function ContractRewardsDetail({
  smartContractAddress,
  tickNumber,
  distribution
}: Props) {
  const { t } = useTranslation('network-page')
  const [, setSearchParams] = useSearchParams()

  const page = useValidatedPage()
  const pageSize = useValidatedPageSize()
  const offset = (page - 1) * pageSize
  const { handlePageChange, handlePageSizeChange } = usePaginationSearchParams()

  const { data, isFetching, isError } = useGetEventsQuery({
    tickNumber,
    source: smartContractAddress,
    logType: [QU_TRANSFER],
    category: DIVIDEND_CATEGORY,
    offset,
    size: pageSize
  })

  const events = data?.events ?? []
  const total = data?.total ?? 0
  const pageCount = Math.ceil(total / pageSize)

  usePageAutoCorrect(!!data, total, pageSize)

  const handleBack = useCallback(() => {
    setSearchParams(
      (prev) => {
        prev.delete('tick')
        prev.delete('page')
        return prev
      },
      { replace: false }
    )
  }, [setSearchParams])

  // Snapshot the distribution so the header doesn't blank out when the user
  // paginates the transfers — paginating writes ?page=, the parent's
  // useContractRewards picks up that param and re-fetches the rewards list at
  // the new page, and `distribution` (looked up via `distributions.find(...)`)
  // becomes undefined because the selected tick isn't in that page.
  const [snapshotDistribution, setSnapshotDistribution] = useState(distribution)
  useEffect(() => {
    if (distribution !== undefined) {
      setSnapshotDistribution(distribution)
    }
  }, [distribution])

  const headerEpoch = snapshotDistribution?.epoch ?? events[0]?.epoch

  return (
    <div className="grid gap-16">
      <BetaBanner />
      <button
        type="button"
        onClick={handleBack}
        className="flex w-fit items-center gap-6 text-sm text-gray-50 transition-colors hover:text-white"
      >
        <ArrowLeftIcon className="size-16 rtl:rotate-180 rtl:transform" />
        {t('backToRewards')}
      </button>

      <CardItem className="grid gap-8 p-20 sm:grid-cols-2">
        <div>
          <p className="font-space text-xs text-gray-50">{t('tick')}</p>
          <div className="mt-4 font-space text-base">
            <TickLink value={tickNumber} className="text-primary-30 hover:underline" />
          </div>
        </div>
        <div>
          <p className="font-space text-xs text-gray-50">{t('epoch')}</p>
          <p className="mt-4 font-space text-base">{headerEpoch ?? '-'}</p>
        </div>
      </CardItem>

      <div className="flex flex-wrap items-center justify-between gap-8">
        {total > 0 ? (
          <span className="text-sm text-gray-50">
            {t('transfers')} ({formatString(total)})
          </span>
        ) : (
          <span />
        )}
        <PageSizeSelect pageSize={pageSize} onSelect={handlePageSizeChange} />
      </div>

      <CardItem className="flex flex-col overflow-hidden">
        {isError && (
          <div className="p-16 text-center text-sm text-gray-50">{t('eventsLoadFailed')}</div>
        )}
        {!isFetching && !isError && events.length === 0 && (
          <div className="p-16 text-center text-sm text-gray-50">{t('noTransfers')}</div>
        )}
        {(isFetching || events.length > 0) && !isError && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-primary-60 bg-primary-70 text-left text-xs text-gray-50">
                <tr>
                  <th className="px-16 py-12 font-400">{t('id')}</th>
                  <th className="px-16 py-12 font-400">{t('destination')}</th>
                  <th className="px-16 py-12 text-right font-400">{t('amount')}</th>
                  <th className="px-16 py-12 text-right font-400">{t('timestamp')}</th>
                </tr>
              </thead>
              <tbody>
                {isFetching &&
                  Array.from({ length: SKELETON_ROW_COUNT }).map((_, i) => (
                    <tr
                      key={String(`skeleton-${i}`)}
                      className="border-b border-primary-60 last:border-b-0"
                    >
                      {SKELETON_CELLS.map(({ id, className }) => (
                        <td key={id} className="px-16 py-12">
                          <Skeleton className={className} />
                        </td>
                      ))}
                    </tr>
                  ))}
                {!isFetching &&
                  events.map((event) => {
                    const amount = event.amount ?? 0
                    return (
                      <tr key={event.logId} className="border-b border-primary-60 last:border-b-0">
                        <td className="px-16 py-12 font-space text-sm">
                          <EventLink tickNumber={event.tickNumber} logId={event.logId} />
                        </td>
                        <td className="px-16 py-12">
                          {event.destination ? (
                            <DestinationCell address={event.destination} />
                          ) : (
                            <span className="text-sm text-gray-50">-</span>
                          )}
                        </td>
                        <td className="px-16 py-12 text-right font-space text-sm">
                          {formatString(amount)} <span className="text-gray-50">QUBIC</span>
                        </td>
                        <td className="px-16 py-12 text-right text-sm text-gray-50">
                          {formatTimestamp(event.timestamp)}
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        )}
        {pageCount > 1 && (
          <PaginationBar
            className="mx-auto w-fit gap-8 p-20"
            pageCount={pageCount}
            page={page}
            onPageChange={handlePageChange}
          />
        )}
      </CardItem>
    </div>
  )
}
