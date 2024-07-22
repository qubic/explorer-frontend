import type { FC } from 'react'
import { useEffect, useState } from 'react'
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
import { LinearProgress } from '@app/components/ui/loaders'
import { useAppDispatch, useAppSelector } from '@app/hooks/redux'
import { getOverview, selectNetworkOverview } from '@app/store/overviewSlice'
import { clsxTwMerge, formatString } from '@app/utils'
import { CardItem, TickLink } from './components'

function getTickQuality(numberOfTicks: number | undefined, numberOfEmptyTicks: number | undefined) {
  if (!numberOfTicks || !numberOfEmptyTicks) {
    return '0%'
  }
  return `${formatString(((numberOfTicks - numberOfEmptyTicks) * 100) / numberOfTicks)}%`
}

function CardItemComponent({
  icon: Icon,
  label,
  value,
  variant = 'normal'
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: FC<any>
  label: string | JSX.Element
  value: string
  variant?: 'normal' | 'small'
}) {
  return (
    <CardItem className="px-24 py-16">
      <div
        className={clsxTwMerge(
          'flex items-center gap-24',
          variant === 'small' && 'flex-col items-start sm:flex-row sm:items-center gap-16 w-full'
        )}
      >
        <Icon className="w-24 h-24" />
        <div className="flex flex-col gap-8">
          <p className="text-14 text-gray-50 font-space">{label}</p>
          <p className="text-18 xs:text-24 sm:text-22 font-space">{value}</p>
        </div>
      </div>
    </CardItem>
  )
}

const PAGE_SIZE = 120

function OverviewPage() {
  // TODO: Change the renamed destructured variable to the original name
  const { overview: network, isLoading } = useAppSelector(selectNetworkOverview)
  const { t } = useTranslation('network-page')
  const dispatch = useAppDispatch()
  const [page, setPage] = useState(1)

  useEffect(() => {
    dispatch(getOverview())
  }, [dispatch])

  const ticks = network?.ticks || []
  const pageCount = Math.ceil(ticks.length / PAGE_SIZE)
  const startIndex = (page - 1) * PAGE_SIZE
  const displayedTicks = ticks.slice(startIndex, startIndex + PAGE_SIZE)

  const handlePageChange = (event, value) => {
    if (searchTick) {
      setPage(1)
    }
    setPage(value)
  }
  const cardData = [
    {
      id: 'price',
      icon: DollarCoinIcon,
      label: t('price'),
      value: `$${network?.price}`
    },
    {
      id: 'market-cap',
      icon: CoinsStackIcon,
      label: t('marketCap'),
      value: `$${formatString(network?.marketCapitalization)}`
    },
    {
      id: 'current-epoch',
      icon: SandClockIcon,
      label: t('epoch'),
      value: formatString(network?.currentEpoch)
    },
    {
      id: 'circulating-supply',
      icon: CirculatingCoinsIcon,
      label: t('circulatingSupply'),
      value: formatString(network?.supply)
    },
    {
      id: 'active-addresses',
      icon: WalletIcon,
      label: t('activeAddresses'),
      value: formatString(network?.numberOfEntities)
    },
    {
      id: 'current-tick',
      icon: CurrentTickIcon,
      label: t('currentTick'),
      value: formatString(network?.currentTick)
    },
    {
      id: 'ticks-this-epoch',
      icon: EpochTicksIcon,
      label: t('ticksThisEpoch'),
      value: formatString(network?.numberOfTicks)
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
      value: formatString(network?.numberOfEmptyTicks)
    },
    {
      id: 'tick-quality',
      icon: StarsIcon,
      label: t('tickQuality'),
      value: getTickQuality(network?.numberOfTicks, network?.numberOfEmptyTicks)
    }
  ]

  if (isLoading) {
    return <LinearProgress />
  }

  return (
    <div className="w-full pt-32">
      <div className="max-w-[960px] px-16 flex flex-1 flex-col gap-16 mx-auto">
        <div className="grid md:grid-flow-col gap-16">
          {cardData.slice(0, 2).map((card) => (
            <CardItemComponent
              key={card.id}
              icon={card.icon}
              label={card.label}
              value={card.value}
            />
          ))}
        </div>
        <div className="grid 827px:grid-flow-col gap-16">
          {cardData.slice(2, 5).map((card) => (
            <CardItemComponent
              key={card.id}
              icon={card.icon}
              label={card.label}
              value={card.value}
            />
          ))}
        </div>
        <div className="grid grid-cols-2 827px:grid-cols-4 gap-16">
          {cardData.slice(5, 9).map((card) => (
            <CardItemComponent
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
            <div className="flex flex-col sm:flex-row gap-20 sm:gap-8 md:gap-10 lg:gap-20 justify-between">
              <div className="flex justify-between sm:justify-start items-center gap-8">
                <p className="text-22 font-space font-500">{t('ticks')}</p>
                <p className=" align-middle text-14 font-space text-gray-50">
                  ( {formatString(network && network.ticks[0].tick)} -{' '}
                  {formatString(network && network.ticks[network.ticks.length - 1].tick)} )
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-6 md:grid-cols-10 gap-12">
              {displayedTicks.map((item) => (
                <TickLink
                  key={item.tick}
                  value={item.tick}
                  className={`text-12 ${item.arbitrated ? 'text-error-40' : 'text-gray-50'}`}
                />
              ))}
            </div>
            {/* <Pagination
              count={pageCount}
              page={page}
              onChange={handlePageChange}
              variant="outlined"
              shape="rounded"
              siblingCount={siblingCount}
              boundaryCount={boundaryCount}
              sx={{
                mt: 2,
                justifyContent: 'center',
                display: 'flex',
                '& .MuiPaginationItem-root': {
                  color: '#808B9B',
                  border: 'none'
                },
                '& .MuiPaginationItem-root.Mui-selected': {
                  backgroundColor: '#61F0FE',
                  color: '#101820',
                  '&:hover': {
                    backgroundColor: '#03C1DB'
                  }
                }
              }}
              renderItem={(item) => (
                <PaginationItem
                  {...item}
                  components={{
                    previous: ArrowLeftIcon,
                    next: ArrowRightIcon
                  }}
                />
              )}
            /> */}
          </div>
        </CardItem>
      </div>
    </div>
  )
}

export default OverviewPage
