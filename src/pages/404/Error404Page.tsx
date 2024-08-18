import { Error404 } from '@app/assets/images/errors'
import { Header } from '@app/components/ui/layouts'
import { Routes } from '@app/router'
import { useTranslation } from 'react-i18next'
import type { ErrorResponse } from 'react-router-dom'
import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom'

type ErrorContentProps = {
  is404Error?: boolean
  error?: ErrorResponse
}

function ErrorContent({ is404Error = false, error }: ErrorContentProps) {
  const { t } = useTranslation('error-404-page')
  return (
    <>
      <div className="relative flex h-[315px] items-end justify-center overflow-hidden md:h-[496px]">
        {/* // TODO: Put different error img for non 404 errors */}
        <Error404
          className="min-h-[267px] w-full min-w-[742px] max-w-[742px] md:h-[460px] md:max-w-[1279px]"
          width={742}
          height={267}
        />
      </div>
      <div>
        <h1 className="text-center font-space text-32 font-700 leading-40 md:text-4xl md:leading-tight">
          {is404Error ? t('pageNotFound') : t('title')}
        </h1>
      </div>

      <div className="mx-auto max-w-[400px]">
        <p className="mt-16 text-center font-space text-16 leading-20 text-gray-50 md:text-18">
          {is404Error ? t('error404Message') : t('unexpectedError')}
        </p>
      </div>

      <div className="mt-32 text-center md:mt-40">
        {error && !is404Error && (
          <div className="mx-auto w-fit rounded-md bg-red-100 p-16">
            <p className="text-16 font-medium text-red-800">
              <i>
                {error.status} | {error.statusText}
              </i>
            </p>
            <p className="text-14 text-red-700">
              <i>{String(error.data)}</i>
            </p>
          </div>
        )}
      </div>
    </>
  )
}

export default function Error404Page() {
  const { t } = useTranslation('error-404-page')
  const error = useRouteError()

  return (
    <>
      <Header />
      <main className="min-h-[var(--container-height)] w-full px-8 pb-10 pt-20 sm:min-h-[var(--desktop-container-height)]">
        <div className="h-full w-full">
          {(() => {
            if (!isRouteErrorResponse(error)) {
              return <ErrorContent />
            }

            return error.status === 404 ? (
              <ErrorContent is404Error />
            ) : (
              <ErrorContent error={error} />
            )
          })()}

          <div className="mt-32 text-center md:mt-40">
            <Link
              className="rounded-8 bg-primary-30 px-28 py-10 font-space text-16 font-500 leading-28 text-primary-70"
              to={Routes.NETWORK.ROOT}
              role="button"
            >
              {t('backToHomePage')}
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
