import { memo, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

import { CardItem } from '@app/pages/network/components'
import { clsxTwMerge, formatString } from '@app/utils'
import type { DailySnapshot, EpochStats } from '../mock-data'

type TimeRange = '7d' | '30d' | '90d' | 'epoch' | 'all'

type Props = {
  dailyData: DailySnapshot[]
  epochData: EpochStats[]
}

function BalanceHistoryChart({ dailyData, epochData }: Props) {
  const { t } = useTranslation('network-page')
  const [timeRange, setTimeRange] = useState<TimeRange>('30d')

  const chartData = useMemo(() => {
    if (timeRange === 'epoch') {
      return epochData.map((stat) => ({
        date: `E${stat.epoch}`,
        balance: stat.endBalance
      }))
    }

    let filteredData: DailySnapshot[]
    if (timeRange === 'all') {
      filteredData = dailyData
    } else {
      let days = 90
      if (timeRange === '7d') days = 7
      else if (timeRange === '30d') days = 30
      filteredData = dailyData.slice(-days)
    }

    return filteredData.map((snapshot) => ({
      ...snapshot,
      date: new Date(snapshot.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    }))
  }, [dailyData, epochData, timeRange])

  const timeRangeOptions: { value: TimeRange; label: string }[] = [
    { value: '7d', label: t('7days') },
    { value: '30d', label: t('30days') },
    { value: '90d', label: t('90days') },
    { value: 'epoch', label: t('byEpoch') },
    { value: 'all', label: t('allTime') }
  ]

  return (
    <CardItem className="p-16">
      <div className="mb-16 flex flex-wrap items-center justify-between gap-8">
        <p className="font-space text-16 font-500">{t('balanceHistoryTitle')}</p>
        <div className="flex overflow-hidden rounded-8 border border-primary-60">
          {timeRangeOptions.map((option, index) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setTimeRange(option.value)}
              className={clsxTwMerge(
                'px-12 py-4 text-xs font-500 transition-colors',
                index < timeRangeOptions.length - 1 && 'border-r border-primary-60',
                timeRange === option.value
                  ? 'bg-primary-30 text-primary-80'
                  : 'bg-primary-70 text-gray-50 hover:bg-primary-60'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="date"
              stroke="#9ca3af"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#9ca3af"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value: number) => `${(value / 1000000).toFixed(1)}M`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              labelStyle={{ color: '#9ca3af' }}
              formatter={(value: number) => [`${formatString(value)} QUBIC`, t('balance')]}
            />
            <Area
              type="monotone"
              dataKey="balance"
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#balanceGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </CardItem>
  )
}

const MemoizedBalanceHistoryChart = memo(BalanceHistoryChart)

export default MemoizedBalanceHistoryChart
