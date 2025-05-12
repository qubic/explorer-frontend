import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

import { withHelmet } from '@app/components/hocs'
import { PageLayout } from '@app/components/ui/layouts'
import { OVERVIEW_DATA_POLLING_INTERVAL_MS } from '@app/constants'
import { SmartContracts } from '@app/constants/qubic'
import { useGetAddressBalancesQuery, useGetLatestStatsQuery } from '@app/store/apis/archiver-v1'
import { useGetEpochTicksQuery } from '@app/store/apis/archiver-v2'
import { useGetTickQualityQuery } from '@app/store/apis/qli'
import { LatestStats, TickList } from './components'
import { TICKS_PAGE_SIZE } from './constants'

function OverviewPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = parseInt(searchParams.get('ticksPage') || '1', 10)

  const latestStats = useGetLatestStatsQuery(undefined, {
    pollingInterval: OVERVIEW_DATA_POLLING_INTERVAL_MS
  })
  const qEarnBalance = useGetAddressBalancesQuery(
    { address: SmartContracts.QEarn },
    { pollingInterval: OVERVIEW_DATA_POLLING_INTERVAL_MS }
  )
  const tickQuality = useGetTickQualityQuery(undefined, {
    pollingInterval: OVERVIEW_DATA_POLLING_INTERVAL_MS
  })

  const epochTicks = useGetEpochTicksQuery(
    {
      epoch: latestStats.data?.epoch ?? 0,
      pageSize: TICKS_PAGE_SIZE,
      page
    },
    { skip: !latestStats.data, pollingInterval: OVERVIEW_DATA_POLLING_INTERVAL_MS }
  )

  const handlePageChange = useCallback(
    (value: number) => {
      setSearchParams({ ticksPage: value.toString() })
    },
    [setSearchParams]
  )

  return (
    <PageLayout className="flex flex-1 flex-col gap-16">
      <LatestStats
        latestStats={latestStats.data}
        tickQuality={tickQuality.data}
        totalValueLocked={qEarnBalance.data?.balance ?? ''}
        isLoading={latestStats.isLoading || qEarnBalance.isLoading || tickQuality.isLoading}
        isError={latestStats.isError}
      />
      <TickList
        data={epochTicks.data}
        isLoading={latestStats.isLoading || epochTicks.isLoading}
        isError={epochTicks.isError}
        onPageChange={handlePageChange}
      />
    </PageLayout>
  )
}

const OverviewPageWithHelmet = withHelmet(OverviewPage, {
  title: 'Overview | Qubic Explorer'
})

export default OverviewPageWithHelmet
