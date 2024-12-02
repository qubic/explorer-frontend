import { memo, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { Alert, PaginationBar, Skeleton } from '@app/components/ui'
import type { GetEpochTicksResponse } from '@app/store/apis/archiver-v2.types'
import { clsxTwMerge, formatString } from '@app/utils'
import { CardItem, TickLink } from '../../components'
import { TICKS_PAGE_SIZE } from '../constants'

const TicksSkeleton = memo(() =>
  Array.from({ length: TICKS_PAGE_SIZE }).map((_, index) => (
    <Skeleton key={String(`${index}`)} className="h-16 w-64 rounded-sm" />
  ))
)

type Props = Readonly<{
  data: GetEpochTicksResponse | undefined
  isLoading: boolean
  isError: boolean
  onPageChange: (value: number) => void
}>

export default function TickList({ data, isLoading, isError, onPageChange }: Props) {
  const { t } = useTranslation('network-page')

  const tickRange = useMemo(
    () => ({
      firstTick: formatString(data?.ticks?.[0].tickNumber ?? 0),
      lastTick: formatString(data?.ticks?.at(-1)?.tickNumber ?? 0)
    }),
    [data]
  )

  const renderTicksContent = useCallback(() => {
    if (isLoading) {
      return <TicksSkeleton />
    }

    if (!data || isError) {
      return (
        <Alert variant="error" className="col-span-full">
          {t('ticksLoadFailed')}
        </Alert>
      )
    }

    return data?.ticks.map((item) => (
      <TickLink
        key={item.tickNumber}
        value={item.tickNumber}
        className={clsxTwMerge(
          'w-fit font-space text-xs',
          item.isEmpty ? 'text-error-40' : 'text-gray-50'
        )}
      />
    ))
  }, [data, isLoading, isError, t])

  return (
    <CardItem className="px-24 py-20">
      <div className="flex flex-col gap-20">
        <div className="flex flex-col justify-between gap-20 sm:flex-row sm:gap-8 md:gap-10 lg:gap-20">
          <div className="flex items-center justify-between gap-8 sm:justify-start">
            <p className="font-space text-22 font-500">{t('ticks')}</p>
            <p className="align-middle font-space text-14 text-gray-50">
              ( {tickRange.firstTick} - {tickRange.lastTick} )
            </p>
          </div>
        </div>
        <ul className="grid grid-cols-3 gap-12 xs:grid-cols-4 sm:grid-cols-6 md:grid-cols-10">
          {renderTicksContent()}
        </ul>
        <PaginationBar
          className="mt-16 justify-center gap-10"
          pageCount={data?.pagination.totalPages ?? 1}
          page={data?.pagination.currentPage ?? 1}
          onPageChange={onPageChange}
        />
      </div>
    </CardItem>
  )
}
