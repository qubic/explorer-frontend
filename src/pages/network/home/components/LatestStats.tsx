import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import {
  CirculatingCoinsIcon,
  CoinsStackIcon,
  CurrentTickIcon,
  DollarCoinIcon,
  EpochTicksIcon,
  FireIcon,
  Infocon,
  LockIcon,
  SandClockIcon,
  StarsIcon,
  WalletIcon
} from '@app/assets/icons'
import { Alert, Skeleton, Tooltip } from '@app/components/ui'
import type { GetLatestStatsResponse, GetTickInfoResponse } from '@app/store/apis/archiver-v1'
import type { TickQualityResponse } from '@app/store/apis/qli'
import { formatQubicPrice, formatString } from '@app/utils'
import OverviewCardItem from './OverviewCardItem'

function getTickQuality(tickQuality: number | undefined) {
  if (!tickQuality) {
    return '0%'
  }
  return `${formatString(tickQuality)}%`
}

function calculateTickQuality(
  nonEmpty: number | undefined,
  empty: number | undefined
): number | undefined {
  if (nonEmpty !== undefined && empty !== undefined) {
    const total = empty + nonEmpty
    if (total === 0) return undefined // avoid division by 0
    return (nonEmpty / total) * 100
  }
  return undefined
}

const LatestStatsSkeleton = memo(() => (
  <>
    <div className="grid gap-16 md:grid-flow-col">
      {Array.from({ length: 3 }).map((_, index) => (
        <Skeleton key={String(`${index}`)} className="h-82 w-full rounded-md md:h-[87px]" />
      ))}
    </div>
    <div className="grid gap-16 827px:grid-flow-col">
      {Array.from({ length: 3 }).map((_, index) => (
        <Skeleton key={String(`${index}`)} className="h-82 w-full rounded-md md:h-[87px]" />
      ))}
    </div>
    <div className="grid grid-cols-2 gap-16 827px:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={String(`${index}`)} className="h-82 w-full rounded-md md:h-[87px]" />
      ))}
    </div>
  </>
))

type Props = Readonly<{
  latestStats: GetLatestStatsResponse['data'] | undefined
  totalValueLocked: string
  tickQuality: TickQualityResponse | undefined
  tickInfo: GetTickInfoResponse['tickInfo'] | undefined
  isLoading: boolean
  isError: boolean
}>

export default function LatestStats({
  latestStats,
  totalValueLocked,
  tickQuality,
  tickInfo,
  isLoading,
  isError
}: Props) {
  const { t } = useTranslation('network-page')

  const cardData = useMemo(
    () => [
      {
        id: 'price',
        icon: DollarCoinIcon,
        label: t('price'),
        value: formatQubicPrice(latestStats?.price)
      },
      {
        id: 'market-cap',
        icon: CoinsStackIcon,
        label: t('marketCap'),
        value: `$${formatString(latestStats?.marketCap)}`
      },
      {
        id: 'active-addresses',
        icon: WalletIcon,
        label: t('activeAddresses'),
        value: formatString(latestStats?.activeAddresses)
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
        value: formatString(Number(latestStats?.circulatingSupply ?? 0) - Number(totalValueLocked))
      },
      {
        id: 'burned-supply',
        icon: FireIcon,
        label: t('burnedSupply'),
        value: formatString(latestStats?.burnedQus)
      },
      {
        id: 'totalValueLocked',
        icon: LockIcon,
        label: t('totalValueLocked'),
        value: formatString(totalValueLocked)
      },
      {
        id: 'current-tick',
        icon: CurrentTickIcon,
        label: t('currentTick'),
        value: formatString(tickInfo?.tick)
      },
      {
        id: 'ticks-this-epoch',
        icon: EpochTicksIcon,
        label: (
          <span className="flex items-center gap-4 text-inherit">
            {t('ticksThisEpoch')}
            <Tooltip tooltipId="ticks-this-epoch" content={t('ticksThisEpochTooltip')}>
              <Infocon className="size-16 shrink-0" />
            </Tooltip>
          </span>
        ),
        value: `${formatString(latestStats?.ticksInCurrentEpoch)} (${formatString(latestStats?.emptyTicksInCurrentEpoch)})`
      },
      {
        id: 'tick-quality',
        icon: StarsIcon,
        label: (
          <span className="flex items-center gap-4 text-inherit">
            {t('tickQuality')}
            <Tooltip tooltipId="tick-quality" content={t('tickQualityTooltip')}>
              <Infocon className="size-16 shrink-0" />
            </Tooltip>
          </span>
        ),
        value: getTickQuality(latestStats?.epochTickQuality)
      },
      {
        id: 'last-n-tick-quality',
        icon: StarsIcon,
        label: (
          <span className="flex items-center gap-4 text-inherit">
            {t('lastNTickQuality')}
            <Tooltip tooltipId="last-n-tick-quality" content={t('lastNTickQualityTooltip')}>
              <Infocon className="size-16 shrink-0" />
            </Tooltip>
          </span>
        ),
        value: getTickQuality(
          calculateTickQuality(tickQuality?.last10000NonEmpty, tickQuality?.last10000Empty)
        )
      }
    ],
    [t, totalValueLocked, latestStats, tickQuality, tickInfo]
  )

  if (isLoading) {
    return <LatestStatsSkeleton />
  }

  if (!latestStats || isError) {
    return (
      <Alert variant="error" className="col-span-full">
        {t('latestStatsLoadFailed')}
      </Alert>
    )
  }

  return (
    <>
      <div className="grid gap-16 948px:grid-flow-col">
        {cardData.slice(0, 4).map((card) => (
          <OverviewCardItem key={card.id} icon={card.icon} label={card.label} value={card.value} />
        ))}
      </div>
      <div className="grid gap-16 948px:grid-flow-col">
        {cardData.slice(4, 7).map((card) => (
          <OverviewCardItem key={card.id} icon={card.icon} label={card.label} value={card.value} />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-16 948px:grid-cols-4">
        {cardData.slice(7, 11).map((card) => (
          <OverviewCardItem
            key={card.id}
            icon={card.icon}
            label={card.label}
            value={card.value}
            variant="small"
          />
        ))}
      </div>
    </>
  )
}
