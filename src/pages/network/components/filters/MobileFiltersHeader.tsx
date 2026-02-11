import { useTranslation } from 'react-i18next'

import { XmarkIcon } from '@app/assets/icons'

type Props = {
  onClose: () => void
}

export default function MobileFiltersHeader({ onClose }: Props) {
  const { t } = useTranslation('network-page')

  return (
    <div className="flex shrink-0 items-center justify-between border-b border-primary-60 px-16 py-14">
      <h2 className="text-base font-medium text-white">{t('filters')}</h2>
      <button
        type="button"
        onClick={onClose}
        className="flex h-32 w-32 items-center justify-center rounded-full bg-primary-60 hover:bg-primary-50"
        aria-label="Close filters"
      >
        <XmarkIcon className="h-16 w-16 text-white" />
      </button>
    </div>
  )
}
