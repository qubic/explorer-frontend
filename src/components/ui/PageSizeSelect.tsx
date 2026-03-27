import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import type { Option } from '@app/components/ui/Select'
import Select from '@app/components/ui/Select'
import { PAGE_SIZE_OPTIONS } from '@app/constants'
import { clsxTwMerge } from '@app/utils'

type Props = Readonly<{
  pageSize: number
  onSelect: (option: Option) => void
  className?: string
}>

export default function PageSizeSelect({ pageSize, onSelect, className }: Props) {
  const { t } = useTranslation('network-page')

  const defaultValue = useMemo(
    () => PAGE_SIZE_OPTIONS.find((option) => option.value === String(pageSize)),
    [pageSize]
  )

  return (
    <div className={clsxTwMerge('flex items-center gap-8 font-space text-sm', className)}>
      <span className="text-gray-50">{t('showPerPagePrefix')}</span>
      <Select
        className="w-[72px]"
        label={`${t('showPerPagePrefix')} ${t('showPerPageSuffix')}`}
        defaultValue={defaultValue}
        onSelect={onSelect}
        options={PAGE_SIZE_OPTIONS}
        size="sm"
        textCenter
      />
      <span className="text-gray-50">{t('showPerPageSuffix')}</span>
    </div>
  )
}
