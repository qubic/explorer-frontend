import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { LinearProgress } from '@app/components/ui/loaders'
import metricsApiService from '@app/services/metrics/metricsApiService'
import { QubicStats } from '@app/services/metrics/types'
import { CardItem } from './components'

import { AreaChart } from '@app/components/charts/AreaChart'
import { formatString } from '@app/utils'

async function getData() {
  const [overviewStats] = await Promise.all([metricsApiService.getQubicStats()])
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

export default function HistoryPage() {
  const { t } = useTranslation('global')

  const [overviewStats, setOverviewStats] = useState<QubicStats[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getData()
      .then((data) => {
        console.log(data)
        setOverviewStats(data.data)
      })
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) {
    return <LinearProgress />
  }

  return (
    <div className="w-full py-32">
      <div className="mx-auto flex max-w-[960px] flex-1 flex-col gap-16 px-16">
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
            <AreaChart
              className="h-320"
              data={overviewStats || []}
              index="date"
              categories={['marketCap']}
              valueFormatter={(value) => `$${formatString(value)}`}
              showYAxis={false}
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
            <AreaChart
              className="h-320"
              data={overviewStats || []}
              index="date"
              categories={['price']}
              valueFormatter={(value) => `$${value}`}
              showYAxis={false}
            />
          </div>
        </CardItem>
        <CardItem className="px-24 py-20">
          <div className="flex flex-col gap-20">
            <div className="flex flex-col justify-between gap-20 sm:flex-row sm:gap-8 md:gap-10 lg:gap-20">
              <div className="flex items-center justify-between gap-8 sm:justify-start">
                <p className="font-space text-22 font-500">{t('activeAddresses')}</p>
                <p className="align-middle font-space text-14 text-gray-50">
                  {calculateVariance(overviewStats, 'activeAddresses')}
                </p>
              </div>
            </div>
            <AreaChart
              className="h-320"
              data={overviewStats || []}
              index="date"
              categories={['activeAddresses']}
              valueFormatter={(value) => `${formatString(value)}`}
              showYAxis={false}
            />
          </div>
        </CardItem>
      </div>
    </div>
  )
}
