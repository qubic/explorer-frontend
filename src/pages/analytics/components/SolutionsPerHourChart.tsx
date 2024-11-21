import { useQueryState } from 'nuqs'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import metricsApiService from '@app/services/metrics/metricsApiService'
import type { QubicLIScoresStats } from '@app/services/metrics/types'

import { AreaChart } from '@app/components/tremor/AreaChart'
import CardItem from './CardItem'
import ChartContainer from './ChartContainer'

async function getData(range: string | null) {
  const [overviewStats] = await Promise.all([
    metricsApiService.getQubicLiquidityScoresStats(range, 'minute')
  ])
  return { ...overviewStats }
}

export default function SolutionsPerHourChart() {
  const { t } = useTranslation('analytics-page')

  const [data, setData] = useState<QubicLIScoresStats[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [range] = useQueryState('range')

  useEffect(() => {
    setIsLoading(true)
    getData(range)
      .then((response) => {
        setData(response.data)
      })
      .finally(() => setIsLoading(false))
  }, [range])

  return (
    <ChartContainer isLoading={isLoading}>
      <CardItem className="w-full px-24 py-20">
        <div className="flex flex-col gap-20">
          <div className="flex flex-col justify-between gap-20 sm:flex-row sm:gap-8 md:gap-10 lg:gap-20">
            <div className="flex items-center justify-between gap-8 sm:justify-start">
              <p className="font-space text-22 font-500">{t('solutionsPerHour')}</p>
              {/* <p className="align-middle font-space text-14 text-gray-50">
                ({calculateVariance(data, 'solutionsPerHour')})
              </p> */}
            </div>
          </div>
          <AreaChart
            showLegend={false}
            className="h-320"
            data={data || []}
            index="date"
            categories={['solutionsPerHour']}
            colors={['primary', 'gray']}
            valueFormatter={(value) => `${value.toFixed(0)} solution/hour`}
          />
        </div>
      </CardItem>
    </ChartContainer>
  )
}
