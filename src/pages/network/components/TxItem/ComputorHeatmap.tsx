import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ChevronDownIcon } from '@app/assets/icons'
import { clsxTwMerge } from '@app/utils'

const GRID_SIZE = 26
// primary-30: #61F0FE
const ACCENT_COLOR = { r: 97, g: 240, b: 254 }

type Stats = Readonly<{
  max: number
  min: number
  avg: number
  median: number
  activeCount: number
  activePercent: number
  total: number
}>

const computeStats = (values: number[]): Stats => {
  const nonZero = values.filter((v) => v > 0)
  const sorted = [...nonZero].sort((a, b) => a - b)
  const max = nonZero.length > 0 ? sorted[sorted.length - 1] : 0
  const min = nonZero.length > 0 ? sorted[0] : 0
  const avg = nonZero.length > 0 ? nonZero.reduce((a, b) => a + b, 0) / nonZero.length : 0
  const median = nonZero.length > 0 ? sorted[Math.floor(nonZero.length / 2)] : 0
  const total = values.reduce((a, b) => a + b, 0)

  return {
    max,
    min,
    avg: Math.round(avg * 10) / 10,
    median,
    activeCount: nonZero.length,
    activePercent: values.length > 0 ? Math.round((nonZero.length / values.length) * 1000) / 10 : 0,
    total
  }
}

const heatmapColor = (value: number, max: number): string => {
  if (value === 0 || max === 0) return ''
  const intensity = Math.max(0.15, value / max)
  return `rgba(${ACCENT_COLOR.r}, ${ACCENT_COLOR.g}, ${ACCENT_COLOR.b}, ${intensity})`
}

type Props = Readonly<{
  values: number[]
  isVote: boolean
  dataLock: string
}>

export default function ComputorHeatmap({ values, isVote, dataLock }: Props) {
  const { t } = useTranslation('network-page')
  const [showGrid, setShowGrid] = useState(false)
  const stats = useMemo(() => computeStats(values), [values])
  const valueLabel = isVote ? t('votes') : t('scores')
  const totalLabel = isVote ? t('totalVotes') : t('totalScore')
  const activeLabel = isVote ? t('computorsWithVotes') : t('activeComputors')

  return (
    <div className="min-w-0 flex-1 space-y-12">
      <dl className="divide-y divide-gray-60">
        {[
          { label: totalLabel, value: stats.total.toLocaleString() },
          { label: activeLabel, value: `${stats.activeCount} / ${values.length}` },
          { label: t('dataLock'), value: dataLock, breakAll: true }
        ].map((row) => (
          <div
            key={row.label}
            className="grid grid-cols-1 gap-4 py-8 first:pt-0 last:pb-0 sm:grid-cols-[minmax(140px,180px)_1fr] sm:gap-10"
          >
            <dt className="font-space text-xs leading-5 text-gray-50">{row.label}</dt>
            <dd
              className={
                row.breakAll
                  ? 'break-all font-space text-sm text-white'
                  : 'font-space text-sm text-white'
              }
            >
              {row.value}
            </dd>
          </div>
        ))}
      </dl>

      {/* Participation bar + distribution stats */}
      <div>
        <div className="mb-4 flex items-center justify-between font-space text-xs">
          <span className="text-gray-50">{t('participation')}</span>
          <span className="text-white">{stats.activePercent}%</span>
        </div>
        <div className="h-6 overflow-hidden rounded-full bg-gray-60">
          <div
            className="h-full rounded-full bg-primary-30"
            style={{ width: `${stats.activePercent}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-16 gap-y-6 sm:grid-cols-4">
        {[
          { label: t('min'), value: stats.min },
          { label: t('max'), value: stats.max },
          { label: t('average'), value: stats.avg },
          { label: t('median'), value: stats.median }
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="font-space text-xs text-gray-50">{stat.label}</p>
            <p className="font-space text-sm text-white">{stat.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Heatmap grid */}
      <div>
        <p className="mb-6 font-space text-xs text-gray-50">{t('computorHeatmap')}</p>
        <div
          className="inline-grid gap-px"
          style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}
        >
          {values.map((value, i) => (
            <div
              // eslint-disable-next-line react/no-array-index-key
              key={i}
              className={clsxTwMerge('h-10 w-10 rounded-sm', value === 0 && 'bg-primary-60')}
              style={value > 0 ? { backgroundColor: heatmapColor(value, stats.max) } : undefined}
              title={`${t('computor')} ${i}: ${value} ${valueLabel}`}
            />
          ))}
        </div>
      </div>

      {/* Expandable value grid */}
      <div className="overflow-hidden rounded-8 border border-gray-60">
        <button
          type="button"
          onClick={() => setShowGrid((prev) => !prev)}
          className="flex w-full items-center justify-between bg-primary-70 px-12 py-8 font-space text-xs text-white hover:bg-primary-70/80"
        >
          <span>
            {isVote ? t('voteData') : t('scoreData')} ({values.length} computors)
          </span>
          <ChevronDownIcon
            className={clsxTwMerge(
              'h-14 w-14 transition-transform duration-300',
              showGrid ? 'rotate-180' : 'rotate-0'
            )}
          />
        </button>
        {showGrid && (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(6rem,1fr))] gap-2 p-12">
            {values.map((value, i) => (
              <div
                // eslint-disable-next-line react/no-array-index-key
                key={i}
                className="rounded-4 bg-primary-60 px-4 py-2 text-center font-space text-xs text-white"
              >
                <span className="text-gray-50">{i}:</span> {value}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
