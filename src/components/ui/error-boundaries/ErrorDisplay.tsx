import { Error404, GenericError } from '@app/assets/images/errors'
import { Alert } from '@app/components/ui'
import { useTranslation } from 'react-i18next'
import type { ErrorResponse } from 'react-router-dom'

type ErrorDisplayProps = {
  is404Error?: boolean
  error?: ErrorResponse | Error
}

export default function ErrorDisplay({ is404Error = false, error }: ErrorDisplayProps) {
  const { t } = useTranslation('error-404-page')
  const ErrorImg = is404Error ? Error404 : GenericError

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
            <Alert variant="error" className="mx-auto w-fit">
              {error instanceof Error ? (
                String(error.message)
              ) : (
                <>
                  <p className="text-base font-medium text-error-40">
                    {error.status} | {error.statusText}
                  </p>
                  <p className="text-sm text-error-40">{String(error.data)}</p>
                </>
              )}
            </Alert>
          )}
        </div>
      </div>
    </>
  )
}
