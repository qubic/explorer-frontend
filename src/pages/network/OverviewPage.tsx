import { memo, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  CirculatingCoinsIcon,
  CoinsStackIcon,
  CurrentTickIcon,
  DollarCoinIcon,
  EmptyTicksIcon,
  EpochTicksIcon,
  FireIcon,
  Infocon,
  SandClockIcon,
  StarsIcon,
  WalletIcon
} from '@app/assets/icons'
import { PaginationBar, Skeleton, Tooltip } from '@app/components/ui'
import { LinearProgress } from '@app/components/ui/loaders'
import { useGetLatestStatsQuery } from '@app/store/apis/archiver-v1.api'
import { useGetEpochTicksQuery } from '@app/store/apis/archiver-v2.api'
import { clsxTwMerge, formatString } from '@app/utils'
import { CardItem, OverviewCardItem, TickLink } from './components'

function getTickQuality(tickQuality: number | undefined) {
  if (!tickQuality) {
    return '0%'
  }
  return `${formatString(tickQuality)}%`
}

const PAGE_SIZE = 120

const TicksSkeleton = memo(() =>
  Array.from({ length: PAGE_SIZE }).map((_, index) => (
    <Skeleton key={String(`${index}`)} className="h-16 w-64 rounded-sm" />
  ))
)

export default function OverviewPage() {
  const { t } = useTranslation('network-page')
  const [page, setPage] = useState(1)
  const {
    data: latestStats,
    isFetching: isLatestStatsLoading,
    isError: isLatestStatsError
  } = useGetLatestStatsQuery()
  const {
    data: epochTicks,
    isFetching: isEpochTicksLoading,
    isError: isEpochTicksError
  } = useGetEpochTicksQuery(
    {
      epoch: latestStats?.epoch ?? 0,
      pageSize: PAGE_SIZE,
      page
    },
    { skip: !latestStats }
  )

  const handlePageChange = useCallback((value: number) => {
    setPage(value)
  }, [])

  const cardData = useMemo(
    () => [
      {
        id: 'price',
        icon: DollarCoinIcon,
        label: t('price'),
        value: `$${latestStats?.price ?? 0}`
      },
      {
        id: 'market-cap',
        icon: CoinsStackIcon,
        label: t('marketCap'),
        value: `$${formatString(latestStats?.marketCap)}`
      },
      {
        id: 'current-epoch',
        icon: SandClockIcon,
        label: t('epoch'),
        value: formatString(latestStats?.epoch)
      },
      {
        id: 'circulating-supply',
        icon: CirculatingCoinsIcon,
        label: t('circulatingSupply'),
        value: formatString(latestStats?.circulatingSupply)
      },
      {
        id: 'burned-supply',
        icon: FireIcon,
        label: t('burnedSupply'),
        value: formatString(latestStats?.burnedQus)
      },
      {
        id: 'active-addresses',
        icon: WalletIcon,
        label: t('activeAddresses'),
        value: formatString(latestStats?.activeAddresses)
      },
      {
        id: 'current-tick',
        icon: CurrentTickIcon,
        label: t('currentTick'),
        value: formatString(latestStats?.currentTick)
      },
      {
        id: 'ticks-this-epoch',
        icon: EpochTicksIcon,
        label: t('ticksThisEpoch'),
        value: formatString(latestStats?.ticksInCurrentEpoch)
      },
      {
        id: 'empty-ticks',
        icon: EmptyTicksIcon,
        label: (
          <span className="flex items-center gap-4 text-inherit">
            {t('empty')}
            <Tooltip content={t('emptyTooltip')}>
              <Infocon className="size-16 shrink-0" />
            </Tooltip>
          </span>
        ),
        value: formatString(latestStats?.emptyTicksInCurrentEpoch)
      },
      {
        id: 'tick-quality',
        icon: StarsIcon,
        label: t('tickQuality'),
        value: getTickQuality(latestStats?.epochTickQuality)
      }
    ],
    [t, latestStats]
  )

  const tickRange = useMemo(
    () => ({
      firstTick: formatString(epochTicks?.ticks?.[0].tickNumber ?? 0),
      lastTick: formatString(epochTicks?.ticks?.at(-1)?.tickNumber ?? 0)
    }),
    [epochTicks]
  )

  // Triggering error boundary due to data fetch failure.
  if (isLatestStatsError || isEpochTicksError) {
    throw new Error(
      'OverviewPage data load failure: Unable to fetch latest stats or epoch ticks. Please check the network or API status.'
    )
  }

  if (isLatestStatsLoading) {
    return <LinearProgress />
  }

  return (
    <div className="w-full py-32">
      <div className="mx-auto flex max-w-[960px] flex-1 flex-col gap-16 px-16">
        <div className="grid gap-16 md:grid-flow-col">
          {cardData.slice(0, 3).map((card) => (
            <OverviewCardItem
              key={card.id}
              icon={card.icon}
              label={card.label}
              value={card.value}
            />
          ))}
        </div>
        <div className="grid gap-16 827px:grid-flow-col">
          {cardData.slice(3, 6).map((card) => (
            <OverviewCardItem
              key={card.id}
              icon={card.icon}
              label={card.label}
              value={card.value}
            />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-16 827px:grid-cols-4">
          {cardData.slice(6, 10).map((card) => (
            <OverviewCardItem
              key={card.id}
              icon={card.icon}
              label={card.label}
              value={card.value}
              variant="small"
            />
          ))}
        </div>
        <CardItem className="px-24 py-20">
          <div className="flex flex-col gap-20">
            <div className="flex flex-col justify-between gap-20 sm:flex-row sm:gap-8 md:gap-10 lg:gap-20">
              <div className="flex items-center justify-between gap-8 sm:justify-start">
                <p className="font-space text-22 font-500">{t('ticks')}</p>
                <p className="align-middle font-space text-14 text-gray-50">
                  ( {tickRange.firstTick} - {tickRange.lastTick} )
                </p>
              </div>
              <div className="flex items-center justify-between gap-8 sm:justify-start">
                <p className="font-space text-22 font-500">{t('epochTicks')}</p>
                <p className="align-baseline font-space text-sm text-gray-50">
                  ( {epochTicks?.pagination.totalRecords} )
                </p>
              </div>
            </div>
            <ul className="grid grid-cols-3 gap-12 xs:grid-cols-4 sm:grid-cols-6 md:grid-cols-10">
              {isEpochTicksLoading ? (
                <TicksSkeleton />
              ) : (
                epochTicks?.ticks.map((item) => (
                  <TickLink
                    key={item.tickNumber}
                    value={item.tickNumber}
                    className={clsxTwMerge(
                      'w-fit font-space text-xs',
                      item.isEmpty ? 'text-error-40' : 'text-gray-50'
                    )}
                  />
                ))
              )}
            </ul>
            <PaginationBar
              className="mt-16 justify-center gap-10"
              pageCount={epochTicks?.pagination.totalPages ?? 1}
              page={epochTicks?.pagination.currentPage ?? 1}
              onPageChange={handlePageChange}
            />
          </div>
        </CardItem>
      </div>
    </div>
  )
}
