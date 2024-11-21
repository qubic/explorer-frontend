import { AreaChart } from '@app/components/charts/AreaChart'
import { LinearProgress } from '@app/components/ui/loaders'
import { GithubStatsHistory, metricsApiService } from '@app/services/metrics'
import { useEffect, useState } from 'react'

async function getData() {
  const [historyStats] = await Promise.all([metricsApiService.getGithubStatsHistory()])
  return { ...historyStats }
}

export const HistoryChart = () => {
  const [statsData, setStatsData] = useState<GithubStatsHistory[]>()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getData()
      .then((data) => {
        setStatsData(data.data)
      })
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) {
    return <LinearProgress />
  }

  return (
    <AreaChart
      className="h-320"
      data={statsData || []}
      index="date"
      categories={[
        'commits',
        'contributors',
        'openIssues',
        'closedIssues',
        'branches',
        'releases',
        'starsCount',
        'watchersCount'
      ]}
      colors={['blue', 'emerald', 'violet', 'amber', 'gray', 'cyan', 'pink']}
      onValueChange={(v) => console.log(v)}
    />
  )
}
