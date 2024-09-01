import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  CirculatingCoinsIcon,
  CoinsStackIcon,
  CurrentTickIcon,
  DollarCoinIcon,
  EmptyTicksIcon,
  EpochTicksIcon,
  Infocon,
  SandClockIcon,
  StarsIcon,
  WalletIcon
} from '@app/assets/icons'
import { PaginationBar } from '@app/components/ui'
import { LinearProgress } from '@app/components/ui/loaders'
import { useAppDispatch, useAppSelector } from '@app/hooks/redux'
import { getOverview, selectOverview } from '@app/store/network/overviewSlice'
import { clsxTwMerge, formatString } from '@app/utils'
import { CardItem, OverviewCardItem, TickLink } from './components'

function getTickQuality(numberOfTicks: number | undefined, numberOfEmptyTicks: number | undefined) {
  if (!numberOfTicks || !numberOfEmptyTicks) {
    return '0%'
  }
  return `${formatString(((numberOfTicks - numberOfEmptyTicks) * 100) / numberOfTicks)}%`
}

const PAGE_SIZE = 120

export default function OverviewPage() {
  const { overview, isLoading } = useAppSelector(selectOverview)
  const { t } = useTranslation('network-page')
  const dispatch = useAppDispatch()
  const [page, setPage] = useState(1)

  useEffect(() => {
    dispatch(getOverview())
  }, [dispatch])

  const ticks = overview?.ticks || []
  const pageCount = Math.ceil(ticks.length / PAGE_SIZE)
  const startIndex = (page - 1) * PAGE_SIZE
  const displayedTicks = ticks.slice(startIndex, startIndex + PAGE_SIZE)

  const handlePageChange = (value: number) => {
    setPage(value)
  }

  const cardData = [
    {
      id: 'price',
      icon: DollarCoinIcon,
      label: t('price'),
      value: `$${overview?.price}`
    },
    {
      id: 'market-cap',
      icon: CoinsStackIcon,
      label: t('marketCap'),
      value: `$${formatString(overview?.marketCapitalization)}`
    },
    {
      id: 'current-epoch',
      icon: SandClockIcon,
      label: t('epoch'),
      value: formatString(overview?.currentEpoch)
    },
    {
      id: 'circulating-supply',
      icon: CirculatingCoinsIcon,
      label: t('circulatingSupply'),
      value: formatString(overview?.supply)
    },
    {
      id: 'active-addresses',
      icon: WalletIcon,
      label: t('activeAddresses'),
      value: formatString(overview?.numberOfEntities)
    },
    {
      id: 'current-tick',
      icon: CurrentTickIcon,
      label: t('currentTick'),
      value: formatString(overview?.currentTick)
    },
    {
      id: 'ticks-this-epoch',
      icon: EpochTicksIcon,
      label: t('ticksThisEpoch'),
      value: formatString(overview?.numberOfTicks)
    },
    {
      id: 'empty-ticks',
      icon: EmptyTicksIcon,
      label: (
        <span className="flex items-center gap-10 text-inherit">
          {t('empty')}
          <Infocon />
        </span>
      ),
      value: formatString(overview?.numberOfEmptyTicks)
    },
    {
      id: 'tick-quality',
      icon: StarsIcon,
      label: t('tickQuality'),
      value: useMemo(
        () => getTickQuality(overview?.numberOfTicks, overview?.numberOfEmptyTicks),
        [overview?.numberOfEmptyTicks, overview?.numberOfTicks]
      )
    }
  ]

  if (isLoading) {
    return <LinearProgress />
  }

  return (
    <div className="w-full py-32">
      <div className="mx-auto flex max-w-[960px] flex-1 flex-col gap-16 px-16">
        <div className="grid gap-16 md:grid-flow-col">
          {cardData.slice(0, 2).map((card) => (
            <OverviewCardItem
              key={card.id}
              icon={card.icon}
              label={card.label}
              value={card.value}
            />
          ))}
        </div>
        <div className="grid gap-16 827px:grid-flow-col">
          {cardData.slice(2, 5).map((card) => (
            <OverviewCardItem
              key={card.id}
              icon={card.icon}
              label={card.label}
              value={card.value}
            />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-16 827px:grid-cols-4">
          {cardData.slice(5, 9).map((card) => (
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
                  ( {formatString(overview && overview.ticks[0].tick)} -{' '}
                  {formatString(overview && overview.ticks[overview.ticks.length - 1].tick)} )
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-12 xs:grid-cols-4 sm:grid-cols-6 md:grid-cols-10">
              {displayedTicks.map((item) => (
                <TickLink
                  key={item.tick}
                  value={item.tick}
                  className={clsxTwMerge(
                    'font-space text-xs',
                    item.arbitrated ? 'text-error-40' : 'text-gray-50'
                  )}
                />
              ))}
            </div>
            <PaginationBar pageCount={pageCount} page={page} onPageChange={handlePageChange} />
          </div>
        </CardItem>
      </div>
    </div>
  )
}
