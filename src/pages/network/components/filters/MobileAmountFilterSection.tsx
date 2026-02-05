import { useTranslation } from 'react-i18next'

import AmountFilterContent from './AmountFilterContent'
import MobileFilterSection from './MobileFilterSection'

type AmountRange = {
  start?: string
  end?: string
  presetKey?: string
}

type Props = {
  sectionId: string
  idPrefix: string
  value: AmountRange | undefined
  onChange: (value: AmountRange | undefined) => void
  error: string | null | undefined
}

export default function MobileAmountFilterSection({
  sectionId,
  idPrefix,
  value,
  onChange,
  error
}: Props) {
  const { t } = useTranslation('network-page')

  return (
    <MobileFilterSection id={sectionId} label={t('amount')}>
      <AmountFilterContent
        idPrefix={idPrefix}
        value={value}
        onChange={onChange}
        onApply={() => {}}
        selectedPresetKey={value?.presetKey}
        error={error}
        showApplyButton={false}
        layout="horizontal"
      />
    </MobileFilterSection>
  )
}
