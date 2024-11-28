import { memo, useMemo } from 'react'
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
import { Alert, Skeleton, Tooltip } from '@app/components/ui'
import type { GetLatestStatsResponse } from '@app/services/archiver'
import { formatString } from '@app/utils'
import OverviewCardItem from './OverviewCardItem'

function getTickQuality(tickQuality: number | undefined) {
  if (!tickQuality) {
    return '0%'
  }
  return `${formatString(tickQuality)}%`
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
  isLoading: boolean
  isError: boolean
}>

export default function LatestStats({ latestStats, isLoading, isError }: Props) {
  const { t } = useTranslation('network-page')

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
      <div className="grid gap-16 md:grid-flow-col">
        {cardData.slice(0, 3).map((card) => (
          <OverviewCardItem key={card.id} icon={card.icon} label={card.label} value={card.value} />
        ))}
      </div>
      <div className="grid gap-16 827px:grid-flow-col">
        {cardData.slice(3, 6).map((card) => (
          <OverviewCardItem key={card.id} icon={card.icon} label={card.label} value={card.value} />
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
    </>
  )
}
