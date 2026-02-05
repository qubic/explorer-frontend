import { useTranslation } from 'react-i18next'

type Props = {
  onClick: () => void
}

export default function MobileFiltersApplyButton({ onClick }: Props) {
  const { t } = useTranslation('network-page')

  return (
    <div className="shrink-0 border-t border-primary-60 px-16 py-12">
      <button
        type="button"
        onClick={onClick}
        className="w-full rounded bg-primary-30 px-16 py-10 text-sm font-medium text-primary-80 hover:bg-primary-40"
      >
        {t('applyFilters')}
      </button>
    </div>
  )
}
