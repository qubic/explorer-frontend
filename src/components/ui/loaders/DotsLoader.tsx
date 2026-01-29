import { clsxTwMerge } from '@app/utils'
import { useTranslation } from 'react-i18next'

type Props = {
  className?: string
  showLoadingText?: boolean
  loadingText?: string
}

export default function DotsLoader({ className, showLoadingText, loadingText = '' }: Props) {
  const { t } = useTranslation('global')

  return (
    <div
      className={clsxTwMerge(
        'flex flex-1 flex-col items-center justify-center gap-10 p-24',
        className
      )}
    >
      {showLoadingText && (
        <span className="font-sans text-sm font-medium capitalize text-muted-foreground sm:text-base">
          {loadingText || t('loading')}
        </span>
      )}
      <div className="flex animate-pulse items-center justify-center gap-8">
        <span className="sr-only">{t('loading')}</span>
        <div className="h-10 w-10 animate-bounce rounded-full bg-gray-50 [animation-delay:-0.3s] sm:h-12 sm:w-12" />
        <div className="h-10 w-10 animate-bounce rounded-full bg-gray-50 [animation-delay:-0.15s] sm:h-12 sm:w-12" />
        <div className="h-10 w-10 animate-bounce rounded-full bg-gray-50 sm:h-12 sm:w-12" />
      </div>
    </div>
  )
}
