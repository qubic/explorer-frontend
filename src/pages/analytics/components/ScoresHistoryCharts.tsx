import { useQueryState } from 'nuqs'
import { useTranslation } from 'react-i18next'

import { useGetQubicLIStatsQuery } from '@app/store/apis/metrics-v1.api'
import type { QubicLIStats } from '@app/store/apis/metrics-v1.types'

import { ComboChart } from '@app/components/tremor/ComboChart'

import CardItem from './CardItem'
import ChartContainer from './ChartContainer'

function calculateVariance<K extends keyof QubicLIStats>(stats: QubicLIStats[], key: K): string {
  if (stats.length < 2) return '0%'
  const firstValue = stats[0][key]
  const lastValue = stats[stats.length - 1][key]
  if (typeof firstValue !== 'number' || typeof lastValue !== 'number') {
    return '0%'
  }
  const variance = ((lastValue - firstValue) / firstValue) * 100
  return `${variance.toFixed(2)}%`
}

export default function ScoresHistoryCharts() {
  const { t } = useTranslation('analytics-page')

  const [range] = useQueryState('range')

  const { data = [], isLoading } = useGetQubicLIStatsQuery({ range, timeline: 'weekly' })

  return (
    <ChartContainer isLoading={isLoading}>
      <CardItem className="w-full px-24 py-20">
        <div className="flex flex-col gap-20">
          <div className="flex flex-col justify-between gap-20 sm:flex-row sm:gap-8 md:gap-10 lg:gap-20">
            <div className="flex items-center justify-between gap-8 sm:justify-start">
              <p className="font-space text-22 font-500">{t('weeklyScores')}</p>
              <p className="align-middle font-space text-14 text-gray-50">
                ({calculateVariance(data, 'averageScore')})
              </p>
            </div>
          </div>
          <ComboChart
            showLegend={false}
            className="h-320"
            data={data || []}
            index="date"
            lineSeries={{
              categories: ['averageScore', 'maxScore'],
              colors: ['primary', 'gray'],
              valueFormatter: (value) => `${value.toFixed(0)}`
            }}
            barSeries={{
              categories: ['difficulty'],
              colors: ['gray'],
              valueFormatter: (value) => `${value.toFixed(0)}`
            }}
            enableBiaxial
          />
        </div>
      </CardItem>
    </ChartContainer>
  )
}
