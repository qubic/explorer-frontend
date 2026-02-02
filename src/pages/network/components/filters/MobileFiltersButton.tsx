import { useTranslation } from 'react-i18next'

import { FunnelIcon } from '@app/assets/icons'

type Props = {
  onClick: () => void
}

export default function MobileFiltersButton({ onClick }: Props) {
  const { t } = useTranslation('network-page')

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex shrink-0 items-center gap-6 rounded border border-primary-60 px-10 py-5 font-space text-xs font-medium text-gray-100 transition duration-300 hover:bg-primary-60/60"
    >
      <FunnelIcon className="h-14 w-14" />
      <span>{t('filters')}</span>
    </button>
  )
}
