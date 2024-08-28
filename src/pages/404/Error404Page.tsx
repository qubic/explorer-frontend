import { Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { isRouteErrorResponse, Link, useLocation, useRouteError } from 'react-router-dom'

import { Button } from '@app/components/ui/buttons'
import { ErrorDisplay } from '@app/components/ui/error-boundaries'
import { Header } from '@app/components/ui/layouts'
import { AppLoader } from '@app/components/ui/loaders'
import { Routes } from '@app/router'

function Error404Page() {
  const { t } = useTranslation('error-404-page')
  const error = useRouteError()
  const { pathname } = useLocation()
  const isNotFound = pathname === Routes.NOT_FOUND

  const renderErrorDisplay = () => {
    if (isNotFound || (isRouteErrorResponse(error) && error?.status === 404)) {
      return <ErrorDisplay is404Error />
    }

    if (isRouteErrorResponse(error)) {
      return <ErrorDisplay error={error} />
    }

    return <ErrorDisplay />
  }

  return (
    <>
      <Header />
      <main className="grid min-h-[var(--container-height)] w-full px-8 pb-10 pt-20 sm:min-h-[var(--desktop-container-height)]">
        <div className="grid h-full w-full place-items-center overflow-x-hidden">
          {renderErrorDisplay()}

          <div className="mt-32 text-center md:mt-40">
            <Button as={Link} size="lg" to={Routes.NETWORK.ROOT}>
              {t('backToHomePage')}
            </Button>
          </div>
        </div>
      </main>
    </>
  )
}

export default function Error404PageWithSuspense() {
  return (
    <Suspense fallback={<AppLoader />}>
      <Error404Page />
    </Suspense>
  )
}
