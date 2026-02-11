import { useTranslation } from 'react-i18next'

import { UndoIcon } from '@app/assets/icons'
import Tooltip from '@app/components/ui/Tooltip'

type Props = {
  onClick: () => void
  /** If true, shows tooltip and uses desktop styling */
  showTooltip?: boolean
}

export default function ResetFiltersButton({ onClick, showTooltip = false }: Props) {
  const { t } = useTranslation('network-page')

  const button = (
    <button
      type="button"
      onClick={onClick}
      className={`flex shrink-0 items-center gap-4 text-xs text-gray-50 transition-colors hover:text-white ${
        showTooltip ? 'whitespace-nowrap' : 'ml-auto'
      }`}
    >
      <UndoIcon className="h-14 w-14" />
      <span>{t('resetFilters')}</span>
    </button>
  )

  if (showTooltip) {
    return (
      <Tooltip tooltipId="clear-all-filters" content={t('clearAllFiltersTooltip')}>
        {button}
      </Tooltip>
    )
  }

  return button
}
