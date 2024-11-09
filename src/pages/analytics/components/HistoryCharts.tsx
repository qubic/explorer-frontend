import { useQueryState } from 'nuqs'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ComboChart } from '@app/components/tremor/ComboChart'
import metricsApiService from '@app/services/metrics/metricsApiService'
import type { QubicStats } from '@app/services/metrics/types'

import { AreaChart } from '@app/components/tremor/AreaChart'
import CardItem from './CardItem'
import ChartContainer from './ChartContainer'

async function getData(range: string | null) {
  const [overviewStats] = await Promise.all([metricsApiService.getQubicStats(range)])
  return { ...overviewStats }
}

function calculateVariance<K extends keyof QubicStats>(stats: QubicStats[], key: K): string {
  if (stats.length < 2) return '0%'
  const firstValue = stats[0][key]
  const lastValue = stats[stats.length - 1][key]
  if (typeof firstValue !== 'number' || typeof lastValue !== 'number') {
    return '0%'
  }
  const variance = ((lastValue - firstValue) / firstValue) * 100
  return `${variance.toFixed(2)}%`
}

export default function HistoryCharts() {
  const { t } = useTranslation('global')

  const [overviewStats, setOverviewStats] = useState<QubicStats[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [range] = useQueryState('range')

  useEffect(() => {
    getData(range)
      .then((data) => {
        setOverviewStats(data.data)
      })
      .finally(() => setIsLoading(false))
  }, [range])

  return (
    <ChartContainer isLoading={isLoading}>
      <div className="flex flex-col gap-20">
        <CardItem className="px-24 py-20">
          <div className="flex flex-col gap-20">
            <div className="flex flex-col justify-between gap-20 sm:flex-row sm:gap-8 md:gap-10 lg:gap-20">
              <div className="flex items-center justify-between gap-8 sm:justify-start">
                <p className="font-space text-22 font-500">{t('marketCap')}</p>
                <p className="align-middle font-space text-14 text-gray-50">
                  ({calculateVariance(overviewStats, 'marketCap')})
                </p>
              </div>
            </div>
            <ComboChart
              showLegend={false}
              className="h-320"
              data={overviewStats || []}
              index="date"
              barSeries={{
                categories: ['marketCap'],
                colors: ['primary'],
                valueFormatter: (value) => `$${value.toFixed(0)}`
              }}
              lineSeries={{
                categories: ['btcMarketCap'],
                colors: ['gray'],
                valueFormatter: (value) => `$${value.toFixed(0)}`
              }}
              enableBiaxial
            />
          </div>
        </CardItem>
        <CardItem className="px-24 py-20">
          <div className="flex flex-col gap-20">
            <div className="flex flex-col justify-between gap-20 sm:flex-row sm:gap-8 md:gap-10 lg:gap-20">
              <div className="flex items-center justify-between gap-8 sm:justify-start">
                <p className="font-space text-22 font-500">{t('price')}</p>
                <p className="align-middle font-space text-14 text-gray-50">
                  {calculateVariance(overviewStats, 'price')}
                </p>
              </div>
            </div>

            <ComboChart
              showLegend={false}
              className="h-320"
              data={overviewStats || []}
              index="date"
              barSeries={{
                categories: ['price'],
                colors: ['primary'],
                valueFormatter: (value) => `$${value.toFixed(8)}`
              }}
              lineSeries={{
                categories: ['btcPrice'],
                colors: ['gray'],
                valueFormatter: (value) => `$${value.toFixed(8)}`
              }}
              enableBiaxial
            />
          </div>
        </CardItem>
        <CardItem className="px-24 py-20">
          <div className="flex flex-col gap-20">
            <div className="flex flex-col justify-between gap-20 sm:flex-row sm:gap-8 md:gap-10 lg:gap-20">
              <div className="flex items-center justify-between gap-8 sm:justify-start">
                <p className="font-space text-22 font-500">{t('epoch')}</p>
                <p className="align-middle font-space text-14 text-gray-50">
                  {calculateVariance(overviewStats, 'epoch')}
                </p>
              </div>
            </div>

            <AreaChart
              showLegend={false}
              className="h-320"
              data={overviewStats || []}
              index="date"
              categories={['epoch']}
              colors={['primary']}
              valueFormatter={(value) => `${value.toFixed(0)}`}
            />
          </div>
        </CardItem>
      </div>
    </ChartContainer>
  )
}
