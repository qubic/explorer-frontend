import { AreaChart } from '@app/components/tremor/AreaChart'
import { LinearProgress } from '@app/components/ui/loaders'
import type { GithubStatsHistory } from '@app/services/metrics'
import { metricsApiService } from '@app/services/metrics'
import { useQueryState } from 'nuqs'
import { useEffect, useState } from 'react'

async function getData(range: string | null) {
  const [historyStats] = await Promise.all([metricsApiService.getGithubStatsHistory(range)])
  return { ...historyStats }
}

export default function ReposHistoryChart() {
  const [range] = useQueryState('range')

  const [statsData, setStatsData] = useState<GithubStatsHistory[]>()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getData(range)
      .then((data) => {
        setStatsData(data.data)
      })
      .finally(() => setIsLoading(false))
  }, [range])

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
