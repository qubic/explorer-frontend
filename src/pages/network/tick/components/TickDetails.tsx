import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { ChevronLeftIcon, ChevronRightIcon } from '@app/assets/icons'
import { Skeleton } from '@app/components/ui'
import { Routes } from '@app/router'
import {
  useGetComputorListsForEpochQuery,
  useGetTickDataQuery
} from '@app/store/apis/query-service'
import { formatDate, formatString } from '@app/utils'
import { AddressLink, SubCardItem, TickStatus } from '../../components'

type Props = Readonly<{
  tick: number
}>

export default function TickDetails({ tick }: Props) {
  const { t } = useTranslation('network-page')
  const navigate = useNavigate()

  const {
    data: tickData,
    isFetching: isTickDataLoading,
    error: tickDataError
  } = useGetTickDataQuery(tick, { skip: !tick })

  const { data: computorLists } = useGetComputorListsForEpochQuery(tickData?.epoch ?? 0, {
    skip: !tick || !tickData?.epoch
  })

  const handleTickNavigation = useCallback(
    (direction: 'previous' | 'next') => () => {
      const newTick = Number(tick) + (direction === 'previous' ? -1 : 1)
      navigate(Routes.NETWORK.TICK(newTick))
    },
    [navigate, tick]
  )

  const tickLeader = useMemo(() => {
    if (!computorLists?.length || !tickData) return ''
    // Use the first computor list for the epoch (they all have the same identities)
    return computorLists[0]?.identities?.[tickData?.computorIndex] ?? ''
  }, [computorLists, tickData])

  return (
    <>
      <div className="mb-36 mt-24 flex justify-between gap-12">
        <div className="mt-18 flex flex-col content-start gap-8">
          <div className="flex items-center justify-between gap-10">
            <button
              type="button"
              aria-label="Previous Tick"
              className="flex size-fit rounded-full py-6 pl-11 pr-1 text-gray-50 hover:bg-slate-50 hover:text-white hover:transition hover:duration-300"
              onClick={handleTickNavigation('previous')}
            >
              <ChevronLeftIcon className="size-24 rtl:rotate-180 rtl:transform" />
            </button>
            <p className="font-space text-32 font-500">{formatString(tick)}</p>
            <button
              type="button"
              aria-label="Next Tick"
              className="flex size-fit rounded-full py-6 pl-1 pr-11 text-gray-50 hover:bg-slate-50 hover:text-white hover:transition hover:duration-300"
              onClick={handleTickNavigation('next')}
            >
              <ChevronRightIcon className="size-24 rtl:rotate-180 rtl:transform" />
            </button>
          </div>
          {!tickDataError && (
            <p className="font-space text-sm text-gray-50">{formatDate(tickData?.timestamp)}</p>
          )}
        </div>
        {/* Desktop TickStatus */}
        <div className="hidden md:block">
          <TickStatus
            dataStatus={!tickDataError}
            tickStatus={Boolean(tickData?.transactionHashes?.length)}
            transactions={tickData?.transactionHashes?.length ?? 0}
          />
        </div>
      </div>
      {!tickDataError && (
        <div className="mb-24">
          <SubCardItem
            title={t('epoch')}
            variant="secondary"
            content={
              isTickDataLoading ? (
                <Skeleton className="h-16 w-64 rounded-8" />
              ) : (
                <p className="font-space text-sm text-gray-50">{tickData?.epoch}</p>
              )
            }
          />
          <SubCardItem
            title={t('signature')}
            variant="secondary"
            content={
              isTickDataLoading ? (
                <Skeleton className="h-40 rounded-8 sm:h-20" />
              ) : (
                <p className="break-all font-space text-sm text-gray-50">{tickData?.signature}</p>
              )
            }
          />
          <SubCardItem
            title={t('tickLeader')}
            variant="secondary"
            content={
              isTickDataLoading ? (
                <Skeleton className="h-40 rounded-8 sm:h-20" />
              ) : (
                tickLeader && <AddressLink value={tickLeader} copy />
              )
            }
          />
        </div>
      )}
      {/* Mobile TickStatus */}
      <div className="mb-24 md:hidden">
        <TickStatus
          dataStatus={!tickDataError}
          tickStatus={Boolean(tickData?.transactionHashes?.length)}
          transactions={tickData?.transactionHashes?.length ?? 0}
        />
      </div>
    </>
  )
}
