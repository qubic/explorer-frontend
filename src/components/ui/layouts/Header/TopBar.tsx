import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { Alert, Skeleton } from '@app/components/ui'
import { OVERVIEW_DATA_POLLING_INTERVAL_MS } from '@app/constants'
import { useGetLatestStatsQuery } from '@app/store/apis/rpc-stats'
import { formatQubicPrice } from '@app/utils'
import LanguagePicker from './LanguagePicker'
import NetworkSelector from './NetworkSelector'
import SearchBar from './SearchBar/SearchBar'
import ThemeToggle from './ThemeToggle'

export default function TopBar() {
  const { t } = useTranslation('network-page')

  const { data, isLoading, isError } = useGetLatestStatsQuery(undefined, {
    pollingInterval: OVERVIEW_DATA_POLLING_INTERVAL_MS
  })

  const renderQubicPrice = useCallback(() => {
    if (isLoading) {
      return <Skeleton className="h-14 w-80 rounded-md" tag="span" />
    }

    if (isError) {
      return (
        <Alert variant="error" size="sm" className="rounded-md px-8 py-6">
          {t('errorLoadingPrice')}
        </Alert>
      )
    }
    return <span className="text-primary-30">{formatQubicPrice(data?.price)}</span>
  }, [data, isLoading, isError, t])

  return (
    <section className="sticky top-0 z-99 border-b border-border bg-background">
      <div className="relative mx-auto flex max-w-lg items-center justify-between px-12 py-4">
        <p className="flex items-center gap-4 text-xs text-muted-foreground">
          QUBIC {t('price')}: {renderQubicPrice()}
        </p>
        <div className="flex items-center gap-8">
          <SearchBar />

          <ThemeToggle />

          <LanguagePicker />

          <NetworkSelector />
        </div>
      </div>
    </section>
  )
}
