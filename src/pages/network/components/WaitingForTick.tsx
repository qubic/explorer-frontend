import { useTranslation } from 'react-i18next'

import { SandClockIcon } from '@app/assets/icons'
import { CopyTextButton, COPY_BUTTON_TYPES } from '@app/components/ui/buttons'
import { PageLayout } from '@app/components/ui/layouts'
import { LinearProgress } from '@app/components/ui/loaders'
import { formatString } from '@app/utils'
import CardItem from './CardItem'

// Time units (s, min, h) are intentionally not localized — they are SI standard
// abbreviations recognized across all supported languages.
function formatEstimatedWait(totalSeconds: number): string {
  if (totalSeconds < 60) return `~${totalSeconds}s`

  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.ceil((totalSeconds % 3600) / 60)

  if (hours > 0) {
    return minutes > 0 ? `~${hours} h ${minutes} min` : `~${hours} h`
  }

  return `~${minutes} min`
}

interface Props {
  txId: string
  targetTick: number
  currentTick: number | undefined
  estimatedWaitSeconds: number | undefined
}

export default function WaitingForTick({
  txId,
  targetTick,
  currentTick,
  estimatedWaitSeconds
}: Props) {
  const { t } = useTranslation('network-page')

  return (
    <PageLayout>
      <div className="flex items-center justify-center py-64">
        <CardItem className="w-full max-w-[520px] px-32 py-32">
          <div className="flex flex-col items-center gap-24">
            <SandClockIcon className="h-48 w-48 text-gray-50" />
            <p className="text-center font-space text-24 font-500">{t('waitingForTickTitle')}</p>
            <p className="text-center font-space text-14 text-gray-50">
              {t('waitingForTickDesc', { targetTick: formatString(targetTick) })}
            </p>
            {estimatedWaitSeconds !== undefined && (
              <p className="font-space text-12 text-gray-50">
                {t('estimatedWait')}:{' '}
                <span className="font-500 text-white">
                  {formatEstimatedWait(estimatedWaitSeconds)}
                </span>
              </p>
            )}
            <div className="flex w-full items-center gap-8 rounded-8 bg-primary-60 px-12 py-8">
              <p className="min-w-0 break-all font-space text-12 text-gray-50">{txId}</p>
              <CopyTextButton
                text={txId}
                type={COPY_BUTTON_TYPES.TRANSACTION}
                className="shrink-0"
              />
            </div>
            <div className="w-full">
              <LinearProgress />
              <div className="mt-4 flex justify-between">
                <span className="font-space text-10 text-primary-40">
                  {t('tick')} {currentTick ? formatString(currentTick) : '...'}
                </span>
                <span className="font-space text-10 text-gray-50">
                  {t('targetTick')} {formatString(targetTick)}
                </span>
              </div>
            </div>
          </div>
        </CardItem>
      </div>
    </PageLayout>
  )
}
