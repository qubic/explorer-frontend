import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { XmarkIcon } from '@app/assets/icons'
import { LinearProgress } from '@app/components/ui/loaders'
import metricsApiService from '@app/services/metrics/metricsApiService'
import type { GithubStatsOverview } from '@app/services/metrics/types'
import { formatString } from '@app/utils'
import {
  RiExportLine,
  RiEyeLine,
  RiFolderOpenLine,
  RiGitBranchLine,
  RiGitRepositoryCommitsLine,
  RiGroup2Line,
  RiStarLine
} from '@remixicon/react'
import { useQueryState } from 'nuqs'
import CardItem from './CardItem'
import OverviewCardItem from './OverviewCardItem'
import ReposHistoryChart from './ReposHistoryChart'

async function getData(range: string | null) {
  const [overviewStats] = await Promise.all([metricsApiService.getGithubStatsOverview(range)])
  return { ...overviewStats }
}

export default function OOSOverviewPage() {
  const { t } = useTranslation('global')

  const [range] = useQueryState('range')

  const [overviewStats, setOverviewStats] = useState<GithubStatsOverview>()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getData(range)
      .then((data) => {
        setOverviewStats(data.data)
      })
      .finally(() => setIsLoading(false))
  }, [range])

  const cardData = useMemo(
    () => [
      {
        id: 'commits',
        icon: <RiGitRepositoryCommitsLine className="h-24 w-24 text-primary-40/80" />,
        label: t('commits'),
        value: formatString(overviewStats?.commits)
      },
      {
        id: 'starsCount',
        icon: <RiStarLine className="h-24 w-24 text-primary-40/80" />,
        label: t('starsCount'),
        value: formatString(overviewStats?.starsCount)
      },
      {
        id: 'contributors',
        icon: <RiGroup2Line className="h-24 w-24 text-primary-40/80" />,
        label: t('contributors'),
        value: formatString(overviewStats?.contributors)
      },
      {
        id: 'watchersCount',
        icon: <RiEyeLine className="h-24 w-24 text-primary-40/80" />,
        label: t('watchersCount'),
        value: formatString(overviewStats?.watchersCount)
      },
      {
        id: 'openIssues',
        icon: <RiFolderOpenLine className="h-24 w-24 text-primary-40/80" />,
        label: t('openIssues'),
        value: formatString(overviewStats?.openIssues)
      },
      {
        id: 'closedIssues',
        icon: <XmarkIcon className="h-24 w-24 text-primary-40/80" />,
        label: t('closedIssues'),
        value: formatString(overviewStats?.closedIssues)
      },
      {
        id: 'branches',
        icon: <RiGitBranchLine className="h-24 w-24 text-primary-40/80" />,
        label: t('branches'),
        value: formatString(overviewStats?.branches)
      },
      {
        id: 'releases',
        icon: <RiExportLine className="h-24 w-24 text-primary-40/80" />,
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
        <p className="font-space text-18 xs:text-24 sm:text-22">Open Source</p>
        <p className="font-space text-14 text-gray-50">
          Statistics of Qubic&apos;s open source repositories
        </p>
        <div className="grid grid-cols-4 gap-16">
          {cardData.map((card) => (
            <OverviewCardItem
              key={card.id}
              icon={() => card.icon}
              label={card.label}
              value={card.value}
            />
          ))}
        </div>
        <CardItem className="px-24 py-20">
          <div className="flex flex-col gap-20">
            <div className="flex flex-col justify-between gap-20 sm:flex-row sm:gap-8 md:gap-10 lg:gap-20">
              <div className="flex items-center justify-between gap-8 sm:justify-start">
                <p className="font-space text-22 font-500">{t('history')}</p>
              </div>
            </div>
            <ReposHistoryChart />
          </div>
        </CardItem>
      </div>
    </div>
  )
}
