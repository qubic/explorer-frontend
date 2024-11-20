import { AreaChart } from '@app/components/tremor/AreaChart'
import { LinearProgress } from '@app/components/ui/loaders'

import { useGetGithubStatsHistoryQuery } from '@app/store/apis/metrics-v1.api'
import { useQueryState } from 'nuqs'

export default function ReposHistoryChart() {
  const [range] = useQueryState('range')

  const { data: statsData, isLoading } = useGetGithubStatsHistoryQuery(range)

  if (isLoading) {
    return <LinearProgress />
  }

  return (
    <AreaChart
      className="h-320"
      data={statsData || []}
      index="date"
      categories={['starsCount', 'commits', 'openIssues', 'closedIssues', 'watchersCount']}
      colors={['gray', 'gray', 'gray', 'gray', 'gray']}
    />
  )
}
