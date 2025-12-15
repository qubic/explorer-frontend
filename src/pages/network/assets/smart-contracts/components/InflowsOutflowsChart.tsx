import { memo, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { ChevronLeftIcon, ChevronRightIcon } from '@app/assets/icons'
import { CardItem } from '@app/pages/network/components'
import { clsxTwMerge, formatString } from '@app/utils'
import type { EpochStats } from '../mock-data'

const EPOCHS_PER_PAGE = 8

type Props = {
  data: EpochStats[]
}

function InflowsOutflowsChart({ data }: Props) {
  const { t } = useTranslation('network-page')
  const [page, setPage] = useState(0)

  const totalPages = Math.ceil(data.length / EPOCHS_PER_PAGE)

  // Paginate from the end (most recent epochs first)
  const paginatedData = useMemo(() => {
    const endIndex = data.length - page * EPOCHS_PER_PAGE
    const startIndex = Math.max(0, endIndex - EPOCHS_PER_PAGE)
    return data.slice(startIndex, endIndex)
  }, [data, page])

  const chartData = useMemo(
    () =>
      paginatedData.map((stat) => ({
        epoch: `E${stat.epoch}`,
        inflows: stat.totalInflows,
        outflows: stat.totalOutflows
      })),
    [paginatedData]
  )

  const epochRange =
    paginatedData.length > 0
      ? `E${paginatedData[0].epoch} - E${paginatedData[paginatedData.length - 1].epoch}`
      : ''

  // Left arrow = older epochs (higher page), Right arrow = newer epochs (lower page)
  const handleOlder = () => setPage((p) => Math.min(totalPages - 1, p + 1))
  const handleNewer = () => setPage((p) => Math.max(0, p - 1))

  return (
    <CardItem className="p-16">
      <div className="mb-16 flex flex-wrap items-center justify-between gap-8">
        <p className="font-space text-16 font-500">{t('inflowsVsOutflows')}</p>
        {totalPages > 1 && (
          <div className="flex items-center gap-8">
            <span className="text-xs text-gray-50">{epochRange}</span>
            <div className="flex overflow-hidden rounded-8 border border-primary-60">
              <button
                type="button"
                onClick={handleOlder}
                disabled={page === totalPages - 1}
                aria-label="View older epochs"
                className={clsxTwMerge(
                  'flex items-center justify-center p-4 transition-colors',
                  page === totalPages - 1
                    ? 'cursor-not-allowed bg-primary-70 text-gray-600'
                    : 'bg-primary-70 text-gray-50 hover:bg-primary-60'
                )}
              >
                <ChevronLeftIcon className="size-16" />
              </button>
              <button
                type="button"
                onClick={handleNewer}
                disabled={page === 0}
                aria-label="View newer epochs"
                className={clsxTwMerge(
                  'flex items-center justify-center border-l border-primary-60 p-4 transition-colors',
                  page === 0
                    ? 'cursor-not-allowed bg-primary-70 text-gray-600'
                    : 'bg-primary-70 text-gray-50 hover:bg-primary-60'
                )}
              >
                <ChevronRightIcon className="size-16" />
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="mb-8 flex gap-16">
        <div className="flex items-center gap-8">
          <div className="size-12 rounded-2 bg-success-40" />
          <span className="text-xs text-gray-50">{t('inflows')}</span>
        </div>
        <div className="flex items-center gap-8">
          <div className="size-12 rounded-2 bg-red-400" />
          <span className="text-xs text-gray-50">{t('outflows')}</span>
        </div>
      </div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="epoch"
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
              formatter={(value: number, name: string) => [
                `${formatString(value)} QUBIC`,
                name === 'inflows' ? t('inflows') : t('outflows')
              ]}
            />
            <Bar dataKey="inflows" fill="#22c55e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="outflows" fill="#f87171" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </CardItem>
  )
}

const MemoizedInflowsOutflowsChart = memo(InflowsOutflowsChart)

export default MemoizedInflowsOutflowsChart
