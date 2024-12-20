import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

import { withHelmet } from '@app/components/hocs'
import { useGetLatestStatsQuery } from '@app/store/apis/archiver-v1'
import { useGetEpochTicksQuery } from '@app/store/apis/archiver-v2'
import { LatestStats, TickList } from './components'
import { TICKS_PAGE_SIZE } from './constants'

function OverviewPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = parseInt(searchParams.get('ticksPage') || '1', 10)

  const latestStats = useGetLatestStatsQuery()
  const epochTicks = useGetEpochTicksQuery(
    {
      epoch: latestStats.data?.epoch ?? 0,
      pageSize: TICKS_PAGE_SIZE,
      page
    },
    { skip: !latestStats.data }
  )

  const handlePageChange = useCallback(
    (value: number) => {
      setSearchParams({ ticksPage: value.toString() })
    },
    [setSearchParams]
  )

  return (
    <div className="w-full py-32">
      <div className="mx-auto flex max-w-[960px] flex-1 flex-col gap-16 px-16">
        <LatestStats
          latestStats={latestStats.data}
          isLoading={latestStats.isFetching}
          isError={latestStats.isError}
        />
        <TickList
          data={epochTicks.data}
          isLoading={latestStats.isFetching || epochTicks.isFetching}
          isError={epochTicks.isError}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  )
}

const OverviewPageWithHelmet = withHelmet(OverviewPage, {
  title: 'Overview | Qubic Explorer'
})

export default OverviewPageWithHelmet
