import { useTranslation } from 'react-i18next'
import { Button } from '@app/components/ui/buttons'
import type { GetTokenCategoriesResponse } from '@app/store/apis/qubic-static'
import { useGetExplorerTranslationsQuery } from '@app/store/apis/qubic-static'
import { clsxTwMerge } from '@app/utils'

export const CATEGORY_ALL = 'all'
export const CATEGORY_STANDARD = 'standard'

export type CategoryFilter = typeof CATEGORY_ALL | typeof CATEGORY_STANDARD | string

type Props = {
  categoriesData: GetTokenCategoriesResponse
  selectedCategory: CategoryFilter
  onCategoryChange: (category: CategoryFilter) => void
}

export default function CategoryChips({
  categoriesData,
  selectedCategory,
  onCategoryChange
}: Props) {
  const { i18n } = useTranslation()
  const { data: translations } = useGetExplorerTranslationsQuery(i18n.language)

  const getLabel = (nameKey: string) => translations?.[nameKey] ?? nameKey

  const getButtonClasses = (isSelected: boolean) =>
    clsxTwMerge(
      isSelected
        ? 'bg-primary-30 text-primary-80 hover:bg-primary-30 hover:text-primary-80'
        : 'hover:text-primary-30'
    )

  return (
    <ul className="flex flex-wrap gap-10">
      <li>
        <Button
          variant="outlined"
          size="sm"
          className={getButtonClasses(selectedCategory === CATEGORY_ALL)}
          onClick={() => onCategoryChange(CATEGORY_ALL)}
        >
          {getLabel(categoriesData.allCategoryNameKey)}
        </Button>
      </li>
      <li>
        <Button
          variant="outlined"
          size="sm"
          className={getButtonClasses(selectedCategory === CATEGORY_STANDARD)}
          onClick={() => onCategoryChange(CATEGORY_STANDARD)}
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
  )
}
