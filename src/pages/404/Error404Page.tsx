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
      <div className="relative h-[315px] md:h-[496px] overflow-hidden flex justify-center items-end">
        {/* // TODO: Put different error img for non 404 errors */}
        <Error404
          className="w-full min-w-[742px] min-h-[267px] md:h-[460px] max-w-[742px] md:max-w-[1279px]"
          width={742}
          height={267}
        />
      </div>
      <div>
        <h1 className="text-32 leading-40 md:text-4xl md:leading-tight font-700 font-space text-center">
          {is404Error ? t('pageNotFound') : t('title')}
        </h1>
      </div>

      <div className="max-w-[400px] mx-auto">
        <p className="mt-16 text-16 md:text-18 leading-20 font-space text-gray-50 text-center">
          {is404Error ? t('error404Message') : t('unexpectedError')}
        </p>
      </div>

      <div className="mt-32 md:mt-40 text-center">
        {error && !is404Error && (
          <div className="bg-red-100 w-fit p-16 rounded-md mx-auto">
            <p className="text-16 text-red-800 font-medium">
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
      <main className="w-full min-h-[var(--container-height)] sm:min-h-[var(--desktop-container-height)] px-8 pb-10 pt-20">
        <div className="w-full h-full">
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

          <div className="mt-32 md:mt-40 text-center">
            <Link
              className=" py-10 px-28 bg-primary-50 rounded-8 font-500 font-space text-16 leading-28 text-gray-90 "
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
