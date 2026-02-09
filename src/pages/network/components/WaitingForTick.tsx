import { useTranslation } from 'react-i18next'

import { SandClockIcon } from '@app/assets/icons'
import { CopyTextButton, COPY_BUTTON_TYPES } from '@app/components/ui/buttons'
import { PageLayout } from '@app/components/ui/layouts'
import { LinearProgress } from '@app/components/ui/loaders'
import { formatString } from '@app/utils'
import CardItem from './CardItem'

interface Props {
  txId: string
  targetTick: number
  currentTick: number | undefined
  remaining: number | undefined
  isOutOfRange?: boolean
}

export default function WaitingForTick({
  txId,
  targetTick,
  currentTick,
  remaining,
  isOutOfRange
}: Props) {
  const { t } = useTranslation('network-page')

  return (
    <PageLayout>
      <div className="flex items-center justify-center py-64">
        <CardItem className="w-full max-w-[520px] px-32 py-32">
          <div className="flex flex-col items-center gap-24">
            <SandClockIcon className="h-48 w-48 text-gray-50" />
            <p className="text-center font-space text-24 font-500">
              {t(isOutOfRange ? 'waitingForTickOutOfRangeTitle' : 'waitingForTickTitle')}
            </p>
            <p className="text-center font-space text-14 text-gray-50">
              {t(isOutOfRange ? 'waitingForTickOutOfRangeDesc' : 'waitingForTickDesc', {
                targetTick: formatString(targetTick)
              })}
            </p>
            <div className="flex w-full items-center gap-8 rounded-8 bg-primary-60 px-12 py-8">
              <p className="min-w-0 break-all font-space text-12 text-gray-50">{txId}</p>
              <CopyTextButton
                text={txId}
                type={COPY_BUTTON_TYPES.TRANSACTION}
                className="shrink-0"
              />
            </div>
            {!isOutOfRange && (
              <div className="w-full">
                <LinearProgress />
              </div>
            )}
            <div className="grid w-full gap-16 sm:grid-cols-2">
              <div className="flex flex-col items-center gap-4 rounded-12 bg-primary-60 px-16 py-12">
                <p className="font-space text-12 text-gray-50">{t('currentTick')}</p>
                <p className="font-space text-20 font-500">
                  {currentTick ? formatString(currentTick) : '...'}
                </p>
              </div>
              <div className="flex flex-col items-center gap-4 rounded-12 bg-primary-60 px-16 py-12">
                <p className="font-space text-12 text-gray-50">{t('targetTick')}</p>
                <p className="font-space text-20 font-500">{formatString(targetTick)}</p>
              </div>
            </div>
            {!isOutOfRange && (
              <div className="flex flex-col items-center gap-4">
                <p className="font-space text-14 text-gray-50">{t('ticksRemaining')}</p>
                <p className="font-space text-32 font-500 text-primary-30">
                  {remaining === undefined ? '...' : formatString(remaining)}
                </p>
              </div>
            )}
          </div>
        </CardItem>
      </div>
    </PageLayout>
  )
}
