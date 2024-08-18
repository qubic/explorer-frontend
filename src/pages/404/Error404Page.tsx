import { useTranslation } from 'react-i18next'
import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom'

import { Button } from '@app/components/ui/buttons'
import { ErrorDisplay } from '@app/components/ui/error-boundaries'
import { Header } from '@app/components/ui/layouts'
import { Routes } from '@app/router'

export default function Error404Page() {
  const { t } = useTranslation('error-404-page')
  const error = useRouteError()

  return (
    <>
      <Header />
      <main className="min-h-[var(--container-height)] w-full px-8 pb-10 pt-20 sm:min-h-[var(--desktop-container-height)]">
        <div className="grid h-full w-full place-items-center overflow-x-hidden">
          {(() => {
            if (!isRouteErrorResponse(error)) {
              return <ErrorDisplay />
            }

            return error.status === 404 ? (
              <ErrorDisplay is404Error />
            ) : (
              <ErrorDisplay error={error} />
            )
          })()}

          <div className="mt-32 text-center md:mt-40">
            <Button size="lg">
              <Link to={Routes.NETWORK.ROOT} className="text-inherit">
                {t('backToHomePage')}
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </>
  )
}
