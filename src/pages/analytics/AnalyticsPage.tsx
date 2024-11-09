import DateRangeSelector from '@app/components/ui/DateRangeSelector'

import HistoryCharts from './components/HistoryCharts'
import ReposOverview from './components/ReposOverview'
import ScoresHistoryCharts from './components/ScoresHistoryCharts'

export default function AnalyticsPage() {
  return (
    <>
      <div className="mx-auto flex max-w-[960px] flex-1 flex-col items-end gap-20 px-16 py-16">
        <DateRangeSelector />
        <HistoryCharts />
        <ScoresHistoryCharts />
      </div>

      <ReposOverview />
    </>
  )
}
