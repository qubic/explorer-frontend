import { useTranslation } from 'react-i18next'

export default function BetaBanner() {
  const { t } = useTranslation('network-page')

  return (
    <div className="flex items-center gap-12 rounded-8 border-1 border-info-40/30 bg-info-90 px-16 py-14">
      <span className="shrink-0 rounded-4 border-1 border-info-40 px-8 py-2 font-space text-xs font-500 text-info-40">
        BETA
      </span>
      <p className="text-sm text-gray-50">{t('eventsBetaDisclaimer')}</p>
    </div>
  )
}
