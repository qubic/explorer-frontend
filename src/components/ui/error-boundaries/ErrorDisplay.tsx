import { useTranslation } from 'react-i18next'
import type { ErrorResponse } from 'react-router-dom'

import { Error404, GenericError } from '@app/assets/images/errors'
import { Alert } from '@app/components/ui'

type ErrorDisplayProps = Readonly<{
  is404Error?: boolean
  error?: ErrorResponse | Error
  hideErrorHeader?: boolean
}>

export default function ErrorDisplay({
  is404Error = false,
  error,
  hideErrorHeader = false
}: ErrorDisplayProps) {
  const { t } = useTranslation('error-404-page')
  const ErrorImg = is404Error ? Error404 : GenericError

  const renderErrorContent = () => {
    if (!error) {
      return t('unexpectedError')
    }

    if (error instanceof Error) {
      return String(error.message)
    }

    return (
      <>
        <p className="text-base font-medium text-error-40">
          {error.status} | {error.statusText}
        </p>
        <p className="text-sm text-error-40">{String(error.data)}</p>
      </>
    )
  }

  return (
    <>
      <div className="relative overflow-x-hidden">
        <ErrorImg
          className="min-h-[267px] w-full min-w-[742px] max-w-[742px] md:h-[460px] md:max-w-[1279px]"
          width={742}
          height={267}
        />
      </div>
      <div className="h-fit">
        {is404Error && (
          <>
            <div>
              <h1 className="text-center font-space text-32 font-700 leading-40 md:text-4xl md:leading-tight">
                {t('pageNotFound')}
              </h1>
            </div>

            <div className="mx-auto max-w-[400px]">
              <p className="mt-16 text-center font-space text-16 leading-20 text-gray-50 md:text-18">
                {t('error404Message')}
              </p>
            </div>
          </>
        )}

        {!is404Error && !hideErrorHeader && (
          <>
            <div>
              <h1 className="text-center font-space text-32 font-700 leading-40 md:text-4xl md:leading-tight">
                {t('title')}
              </h1>
            </div>

            <div className="mx-auto max-w-[400px]">
              <p className="mt-16 text-center font-space text-16 leading-20 text-gray-50 md:text-18">
                {t('unexpectedError')}
              </p>
            </div>
          </>
        )}

        {!is404Error && (
          <div
            className={
              hideErrorHeader ? 'mt-16 text-center md:mt-16' : 'mt-32 text-center md:mt-40'
            }
          >
            <Alert variant="error" className="mx-auto w-fit">
              {renderErrorContent()}
            </Alert>
          </div>
        )}
      </div>
    </>
  )
}
