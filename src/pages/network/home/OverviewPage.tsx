import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

import { withHelmet } from '@app/components/hocs'
import { PageLayout } from '@app/components/ui/layouts'
import { OVERVIEW_DATA_POLLING_INTERVAL_MS } from '@app/constants'
import { usePollingOptions } from '@app/hooks'
import { useGetLatestStatsQuery } from '@app/store/apis/rpc-stats'
import { useGetAddressBalancesQuery, useGetTickInfoQuery } from '@app/store/apis/rpc-live'
import { useGetEpochTicksQuery } from '@app/store/apis/archiver-v2'
import { useGetTickQualityQuery } from '@app/store/apis/qli'
import { useGetSmartContractsQuery } from '@app/store/apis/qubic-static'
import { LatestStats, TickList } from './components'
import { TICKS_PAGE_SIZE } from './constants'

function OverviewPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Number.parseInt(searchParams.get('ticksPage') || '1', 10)
  const pollingOptions = usePollingOptions(OVERVIEW_DATA_POLLING_INTERVAL_MS)

  const latestStats = useGetLatestStatsQuery(undefined, pollingOptions)

  const { data: smartContracts } = useGetSmartContractsQuery()

  // Get QEarn address from smart contracts API
  const qEarnAddress = useMemo(() => {
    return smartContracts?.find((sc) => sc.name === 'QEARN')?.address
  }, [smartContracts])

  const qEarnBalance = useGetAddressBalancesQuery(
    { address: qEarnAddress ?? '' },
    { ...pollingOptions, skip: !qEarnAddress }
  )
  const tickQuality = useGetTickQualityQuery(undefined, pollingOptions)

  const tickInfo = useGetTickInfoQuery(undefined, pollingOptions)

  const epochTicks = useGetEpochTicksQuery(
    {
      epoch: latestStats.data?.epoch ?? 0,
      pageSize: TICKS_PAGE_SIZE,
      page
    },
    { ...pollingOptions, skip: !latestStats.data }
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
        tickInfo={tickInfo.data}
        totalValueLocked={qEarnBalance.data?.balance ?? ''}
        isLoading={
          latestStats.isLoading ||
          qEarnBalance.isLoading ||
          tickQuality.isLoading ||
          tickInfo.isLoading
        }
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
