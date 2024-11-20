import { useQueryState } from 'nuqs'

import { useTranslation } from 'react-i18next'

import { useGetQubicLIScoresHistoryQuery } from '@app/store/apis/metrics-v1.api'

import { AreaChart } from '@app/components/tremor/AreaChart'

import CardItem from './CardItem'
import ChartContainer from './ChartContainer'

export default function SolutionsChart() {
  const { t } = useTranslation('analytics-page')

  const [range] = useQueryState('range')

  const { data, isLoading } = useGetQubicLIScoresHistoryQuery({ range, timeline: '5min' })

  return (
    <ChartContainer isLoading={isLoading}>
      <CardItem className="w-full px-24 py-20">
        <div className="flex flex-col gap-20">
          <div className="flex flex-col justify-between gap-20 sm:flex-row sm:gap-8 md:gap-10 lg:gap-20">
            <div className="flex items-center justify-between gap-8 sm:justify-start">
              <p className="font-space text-22 font-500">{t('totalSolutions')}</p>
            </div>
          </div>
          <AreaChart
            showLegend={false}
            className="h-320"
            data={data || []}
            index="date"
            categories={['sum']}
            colors={['primary', 'gray']}
            valueFormatter={(value) => `${value.toFixed(0)}`}
          />
        </div>
      </CardItem>
    </ChartContainer>
  )
}
