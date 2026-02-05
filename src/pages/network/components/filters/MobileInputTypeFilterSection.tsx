import { useTranslation } from 'react-i18next'

import MobileFilterSection from './MobileFilterSection'
import RangeFilterContent from './RangeFilterContent'

type RangeValue = {
  start?: string
  end?: string
}

type Props = {
  sectionId: string
  idPrefix: string
  value: RangeValue | undefined
  onChange: (value: RangeValue | undefined) => void
  error: string | null | undefined
}

export default function MobileInputTypeFilterSection({
  sectionId,
  idPrefix,
  value,
  onChange,
  error
}: Props) {
  const { t } = useTranslation('network-page')

  return (
    <MobileFilterSection id={sectionId} label={t('inputType')}>
      <RangeFilterContent
        idPrefix={idPrefix}
        value={value}
        onChange={onChange}
        onApply={() => {}}
        startLabel={t('minInputType')}
        endLabel={t('maxInputType')}
        error={error}
        showApplyButton={false}
        layout="horizontal"
        formatDisplay={false}
      />
    </MobileFilterSection>
  )
}
