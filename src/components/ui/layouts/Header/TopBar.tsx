import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { Alert, Skeleton } from '@app/components/ui'
import { useGetLatestStatsQuery } from '@app/store/apis/archiver-v1'
import LanguagePicker from './LanguagePicker'
import SearchBar from './SearchBar/SearchBar'

export default function TopBar() {
  const { t } = useTranslation('network-page')

  const { data, isFetching, isError } = useGetLatestStatsQuery()

  const renderQubicPrice = useCallback(() => {
    if (isFetching) {
      return <Skeleton className="h-14 w-80 rounded-md" />
    }

    if (isError) {
      return (
        <Alert variant="error" size="sm" className="rounded-md px-8 py-6">
          {t('errorLoadingPrice')}
        </Alert>
      )
    }
    return <span className="text-primary-30">${data?.price}</span>
  }, [data, isFetching, isError, t])

  return (
    <section className="sticky top-0 z-99 border-b border-primary-60 bg-primary-80">
      <div className="relative mx-auto flex max-w-md items-center justify-between px-12 py-4">
        <p className="flex items-center gap-4 text-xs text-gray-50">
          QUBIC {t('price')}: {renderQubicPrice()}
        </p>
        <div className="flex items-center gap-8">
          <SearchBar />

          <LanguagePicker />
        </div>
      </div>
    </section>
  )
}
