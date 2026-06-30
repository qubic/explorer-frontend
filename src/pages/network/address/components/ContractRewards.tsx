import { memo, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'

import { PageSizeSelect, PaginationBar, Skeleton } from '@app/components/ui'
import { usePaginationSearchParams, useValidatedPage, useValidatedPageSize } from '@app/hooks'
import type { SmartContractRewardDistribution } from '@app/store/apis/aggregation'
import { formatString } from '@app/utils'
import { CardItem, TickLink } from '../../components'
import BetaBanner from '../../components/BetaBanner'
import { useContractRewards } from '../hooks'
import ContractRewardsDetail from './ContractRewardsDetail'

const SKELETON_ROW_COUNT = 5

const SKELETON_CELLS = [
  { id: 'epoch', className: 'h-16 w-32' },
  { id: 'tick', className: 'h-16 w-80' },
  { id: 'totalAmount', className: 'ml-auto h-16 w-80' },
  { id: 'amountPerShare', className: 'ml-auto h-16 w-80' },
  { id: 'transferCount', className: 'ml-auto h-16 w-32' },
  { id: 'timestamp', className: 'ml-auto h-16 w-80' }
]

function formatTimestamp(raw: string): string {
  const ms = Number(raw)
  if (!Number.isFinite(ms) || ms <= 0) return '-'
  return new Date(ms).toLocaleString()
}

type RewardsTableProps = Readonly<{
  distributions: SmartContractRewardDistribution[]
  isLoading: boolean
  hasError: boolean
  onSelectTick: (tickNumber: number) => void
  validForTick: number | undefined
  page: number
  pageCount: number
  onPageChange: (value: number) => void
}>

const RewardsTable = memo(function RewardsTable({
  distributions,
  isLoading,
  hasError,
  onSelectTick,
  validForTick,
  page,
  pageCount,
  onPageChange
}: RewardsTableProps) {
  const { t } = useTranslation('network-page')

  return (
    <CardItem className="flex flex-col overflow-hidden">
      {hasError && (
        <div className="p-16 text-center text-sm text-gray-50">{t('rewardsLoadFailed')}</div>
      )}
      {!isLoading && !hasError && distributions.length === 0 && (
        <div className="flex flex-col items-center gap-4 p-16 text-center text-sm text-gray-50">
          <span>{t('noRewards')}</span>
          {validForTick !== undefined && (
            <span className="text-xs">
              {t('eventsValidForTickShort', { tick: validForTick.toLocaleString() })}
            </span>
          )}
        </div>
      )}
      {(isLoading || distributions.length > 0) && !hasError && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-primary-60 bg-primary-70 text-left text-xs text-gray-50">
                <tr>
                  <th className="px-16 py-12 font-400">{t('epoch')}</th>
                  <th className="px-16 py-12 font-400">{t('tick')}</th>
                  <th className="px-16 py-12 text-right font-400">{t('totalAmount')}</th>
                  <th className="px-16 py-12 text-right font-400">{t('amountPerShare')}</th>
                  <th className="px-16 py-12 text-right font-400">{t('transferCount')}</th>
                  <th className="px-16 py-12 text-right font-400">{t('timestamp')}</th>
                </tr>
              </thead>
              <tbody>
                {isLoading &&
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
                {!isLoading &&
                  distributions.map((d) => (
                    <tr
                      key={`${d.tickNumber}-${d.timestamp}`}
                      className="border-b border-primary-60 last:border-b-0"
                    >
                      <td className="px-16 py-12 font-space text-sm">{d.epoch}</td>
                      <td className="px-16 py-12 font-space text-sm">
                        <TickLink
                          value={d.tickNumber}
                          className="text-primary-30 hover:underline"
                        />
                      </td>
                      <td className="px-16 py-12 text-right font-space text-sm">
                        {formatString(d.totalAmount)} <span className="text-gray-50">QUBIC</span>
                      </td>
                      <td className="px-16 py-12 text-right font-space text-sm">
                        {formatString(d.amountPerShare)} <span className="text-gray-50">QUBIC</span>
                      </td>
                      <td className="px-16 py-12 text-right font-space text-sm">
                        <button
                          type="button"
                          onClick={() => onSelectTick(d.tickNumber)}
                          className="font-space text-primary-30 transition-colors hover:underline focus:outline-none focus-visible:underline"
                        >
                          {d.transferCount}
                        </button>
                      </td>
                      <td className="px-16 py-12 text-right text-sm text-gray-50">
                        {formatTimestamp(d.timestamp)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          {pageCount > 1 && (
            <PaginationBar
              className="mx-auto w-fit gap-8 p-20"
              pageCount={pageCount}
              page={page}
              onPageChange={onPageChange}
            />
          )}
        </>
      )}
    </CardItem>
  )
})

type Props = Readonly<{
  smartContractAddress: string
}>

function parseTickParam(raw: string | null): number | undefined {
  if (!raw || !/^\d+$/.test(raw)) return undefined
  const n = Number(raw)
  return Number.isFinite(n) && n > 0 ? n : undefined
}

export default function ContractRewards({ smartContractAddress }: Props) {
  const { t } = useTranslation('network-page')
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedTick = parseTickParam(searchParams.get('tick'))

  const page = useValidatedPage()
  const pageSize = useValidatedPageSize()
  const { handlePageChange, handlePageSizeChange } = usePaginationSearchParams()

  const {
    distributions,
    total,
    totalAllTimeDistributed,
    pageCount,
    isLoading,
    hasError,
    validForTick
  } = useContractRewards(smartContractAddress, selectedTick === undefined)

  const selectedDistribution = useMemo(
    () =>
      selectedTick !== undefined
        ? distributions.find((d) => d.tickNumber === selectedTick)
        : undefined,
    [distributions, selectedTick]
  )

  const formattedAllTime = useMemo(
    () => (totalAllTimeDistributed !== undefined ? formatString(totalAllTimeDistributed) : ''),
    [totalAllTimeDistributed]
  )

  const handleSelectTick = useCallback(
    (tickNumber: number) => {
      setSearchParams(
        (prev) => {
          prev.set('tick', String(tickNumber))
          prev.delete('page')
          return prev
        },
        { replace: false }
      )
    },
    [setSearchParams]
  )

  if (selectedTick !== undefined) {
    return (
      <ContractRewardsDetail
        smartContractAddress={smartContractAddress}
        tickNumber={selectedTick}
        distribution={selectedDistribution}
      />
    )
  }

  return (
    <div className="grid gap-16">
      <BetaBanner />
      <CardItem className="p-20 text-center">
        <p className="font-space text-sm text-gray-50">{t('totalDistributionAllTime')}</p>
        <div className="mt-4 flex items-center justify-center break-all font-space text-2xl sm:text-32">
          {totalAllTimeDistributed === undefined ? (
            <Skeleton className="h-28 w-200 sm:h-36" />
          ) : (
            <>
              {formattedAllTime} <span className="ml-8 text-gray-50">QUBIC</span>
            </>
          )}
        </div>
      </CardItem>
      <div className="flex flex-wrap items-center justify-between gap-8">
        {total > 0 ? (
          <div className="flex flex-col gap-2">
            <span className="text-sm text-gray-50">
              {total === 1
                ? t('rewardsPaidOnOneTick')
                : t('rewardsPaidOnTicks', { count: total.toLocaleString() } as Record<
                    string,
                    string
                  >)}
            </span>
            {validForTick !== undefined && (
              <span className="text-xs text-gray-50">
                {t('eventsValidForTickShort', { tick: validForTick.toLocaleString() })}
              </span>
            )}
          </div>
        ) : (
          <span />
        )}
        <PageSizeSelect pageSize={pageSize} onSelect={handlePageSizeChange} />
      </div>
      <RewardsTable
        distributions={distributions}
        isLoading={isLoading}
        hasError={hasError}
        onSelectTick={handleSelectTick}
        validForTick={validForTick}
        page={page}
        pageCount={pageCount}
        onPageChange={handlePageChange}
      />
    </div>
  )
}
