import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  CheckCircleIcon,
  CirculatingCoinsIcon,
  GlobeGrayIcon,
  SandClockIcon,
  StarsIcon,
  XmarkIcon
} from '@app/assets/icons'
import { LinearProgress } from '@app/components/ui/loaders'
import metricsApiService from '@app/services/metrics/metricsApiService'
import { GithubStatsOverview } from '@app/services/metrics/types'
import { formatString } from '@app/utils'
import { OverviewCardItem } from './components'

async function getData() {
  const [overviewStats] = await Promise.all([metricsApiService.getGithubStatsOverview()])
  return { ...overviewStats }
}

export default function OOSOverviewPage() {
  const { t } = useTranslation('network-page')

  const [overviewStats, setOverviewStats] = useState<GithubStatsOverview>()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    console.log('getData')
    getData()
      .then((data) => {
        console.log('data', data)
        setOverviewStats(data.data)
      })
      .finally(() => setIsLoading(false))
  }, [])

  const cardData = useMemo(
    () => [
      {
        id: 'commits',
        icon: () => <CheckCircleIcon className="h-24 w-24 text-primary-50" />,
        label: t('commits'),
        value: formatString(overviewStats?.commits)
      },
      {
        id: 'stars',
        icon: StarsIcon,
        label: t('stars'),
        value: formatString(overviewStats?.starsCount)
      },
      {
        id: 'contributors',
        icon: () => <GlobeGrayIcon className="h-24 w-24 fill-primary-50" />,
        label: t('contributors'),
        value: formatString(overviewStats?.contributors)
      },
      {
        id: 'open-issues',
        icon: CirculatingCoinsIcon,
        label: t('open-issues'),
        value: formatString(overviewStats?.openIssues)
      },
      {
        id: 'closed-issues',
        icon: () => <XmarkIcon className="h-24 w-24 text-primary-50" />,
        label: t('closed-issues'),
        value: formatString(overviewStats?.closedIssues)
      },
      {
        id: 'branches',
        icon: StarsIcon,
        label: t('branches'),
        value: formatString(overviewStats?.branches)
      },
      {
        id: 'releases',
        icon: SandClockIcon,
        label: t('releases'),
        value: formatString(overviewStats?.releases)
      }
    ],
    [t, overviewStats]
  )

  if (isLoading) {
    return <LinearProgress />
  }

  return (
    <div className="w-full py-32">
      <div className="mx-auto flex max-w-[960px] flex-1 flex-col gap-16 px-16">
        <div className="grid grid-cols-4 gap-16">
          {cardData.map((card) => (
            <OverviewCardItem
              key={card.id}
              icon={card.icon}
              label={card.label}
              value={card.value}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
