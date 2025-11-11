import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { Routes } from '@app/router'
import { Button } from '../buttons'
import ErrorDisplay from './ErrorDisplay'

type Props = Readonly<{
  message: string
  showRetry?: boolean
  showGoHome?: boolean
  hideErrorHeader?: boolean
}>

export default function ErrorLayout({
  message,
  showRetry = true,
  showGoHome = true,
  hideErrorHeader = false
}: Props) {
  const { t } = useTranslation('error-404-page')

  const handleRetry = () => {
    window.location.reload()
  }

  return (
    <div className="mx-auto grid min-h-[inherit] place-items-center overflow-x-hidden p-20">
      <ErrorDisplay error={new Error(message)} hideErrorHeader={hideErrorHeader} />
      <div className="mb-20 mt-60 flex flex-col-reverse items-center gap-20 md:flex-row">
        {showRetry && (
          <Button variant="outlined" onClick={handleRetry}>
            {t('retry')}
          </Button>
        )}

        {showGoHome && (
          <Button variant="filled">
            <Link to={Routes.NETWORK.ROOT} className="text-inherit">
              {t('backToHomePage')}
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}
