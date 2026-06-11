import { useTranslation } from 'react-i18next'

import { CATEGORY_FILTER_OPTIONS, getCategoryLabel } from '@app/store/apis/events'
import { clsxTwMerge } from '@app/utils'

type Props = {
  value: number | undefined
  onChange: (value: number | undefined) => void
  className?: string
}

function getOptionClassName(isSelected: boolean): string {
  return isSelected
    ? 'bg-primary-60 text-primary-30'
    : 'text-gray-50 hover:bg-primary-60/30 hover:text-white'
}

export default function CategorySelect({ value, onChange, className }: Props) {
  const { t } = useTranslation('network-page')

  return (
    <div className={clsxTwMerge('flex flex-col', className)}>
      <button
        type="button"
        className={clsxTwMerge(
          'rounded px-8 py-6 text-left text-xs transition-colors',
          getOptionClassName(value === undefined)
        )}
        onClick={() => onChange(undefined)}
      >
        {t('all')}
      </button>
      {CATEGORY_FILTER_OPTIONS.map((category) => (
        <button
          key={category}
          type="button"
          className={clsxTwMerge(
            'rounded px-8 py-6 text-left text-xs transition-colors',
            getOptionClassName(value === category)
          )}
          onClick={() => onChange(category)}
        >
          {getCategoryLabel(category)}
        </button>
      ))}
    </div>
  )
}
