import { useTranslation } from 'react-i18next'
import { Button } from '@app/components/ui/buttons'
import type { GetTokenCategoriesResponse } from '@app/store/apis/qubic-static'
import { useGetExplorerTranslationsQuery } from '@app/store/apis/qubic-static'
import {
  clsxTwMerge,
  ASSET_CATEGORY_SC_SHARES,
  TOKEN_CATEGORY_STANDARD,
  type CategoryFilter
} from '@app/utils'

type Props = {
  categoriesData: GetTokenCategoriesResponse
  selectedCategory: CategoryFilter
  onCategoryChange: (category: CategoryFilter) => void
  showAll?: boolean
  showScShares?: boolean
  label?: string
}

export default function CategoryChips({
  categoriesData,
  selectedCategory,
  onCategoryChange,
  showAll = false,
  showScShares = false,
  label
}: Props) {
  const { t, i18n } = useTranslation('network-page')
  const { data: translations } = useGetExplorerTranslationsQuery(i18n.language)

  // API categories use API translations, fallback to raw key
  const getLabel = (nameKey: string) => translations?.[nameKey] ?? nameKey

  const getButtonClasses = (isSelected: boolean) =>
    clsxTwMerge(
      isSelected
        ? 'bg-primary-30 text-primary-80 hover:bg-primary-30 hover:text-primary-80'
        : 'hover:text-primary-30'
    )

  return (
    <div className="flex flex-col gap-10">
      {label && <h3 className="text-sm text-gray-50">{label}</h3>}
      <ul className="flex flex-wrap gap-10">
        {showAll && (
          <li>
            <Button
              variant="outlined"
              size="sm"
              className={getButtonClasses(selectedCategory === 'all')}
              onClick={() => onCategoryChange('all')}
            >
              {getLabel(categoriesData.allCategoryNameKey)}
            </Button>
          </li>
        )}
        {showScShares && (
          <li>
            <Button
              variant="outlined"
              size="sm"
              className={getButtonClasses(selectedCategory === ASSET_CATEGORY_SC_SHARES)}
              onClick={() => onCategoryChange(ASSET_CATEGORY_SC_SHARES)}
            >
              {t('scShares')}
            </Button>
          </li>
        )}
        <li>
          <Button
            variant="outlined"
            size="sm"
            className={getButtonClasses(selectedCategory === TOKEN_CATEGORY_STANDARD)}
            onClick={() => onCategoryChange(TOKEN_CATEGORY_STANDARD)}
          >
            {getLabel(categoriesData.defaultCategoryNameKey)}
          </Button>
        </li>
        {categoriesData.categories.map((category) => (
          <li key={category.id}>
            <Button
              variant="outlined"
              size="sm"
              className={getButtonClasses(selectedCategory === category.id)}
              onClick={() => onCategoryChange(category.id)}
            >
              {getLabel(category.nameKey)}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}
