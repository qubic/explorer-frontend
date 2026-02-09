import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Select } from '@app/components/ui'
import type { Option } from '@app/components/ui/Select'
import { useGetSmartContractsQuery } from '@app/store/apis/qubic-static'
import type { TxTypeFilter } from './filterUtils'

type Props = {
  value: TxTypeFilter | undefined
  onChange: (value: TxTypeFilter | undefined) => void
  onApply: () => void
  showApplyButton?: boolean
}

const STANDARD_VALUE = 'standard'
const SC_VALUE = 'sc'
const ALL_PROCEDURES_VALUE = '__all__'

export default function TxTypeFilterContent({
  value,
  onChange,
  onApply,
  showApplyButton = true
}: Props) {
  const { t } = useTranslation('network-page')
  const { data: smartContracts } = useGetSmartContractsQuery()

  // Level 1: Category options
  const categoryOptions = useMemo<Option[]>(
    () => [
      { label: t('standard'), value: STANDARD_VALUE },
      { label: t('smartContract'), value: SC_VALUE }
    ],
    [t]
  )

  // Level 2: Smart Contract options
  const scOptions = useMemo<Option[]>(
    () =>
      (smartContracts ?? []).map((sc) => ({
        label: sc.label || sc.name,
        value: sc.address
      })),
    [smartContracts]
  )

  // State
  const [selectedCategory, setSelectedCategory] = useState<Option | undefined>(() => {
    if (value?.isStandard) return categoryOptions.find((o) => o.value === STANDARD_VALUE)
    if (value?.scAddress) return categoryOptions.find((o) => o.value === SC_VALUE)
    return undefined
  })

  const [selectedSc, setSelectedSc] = useState<Option | undefined>(() => {
    if (!value?.scAddress) return undefined
    return scOptions.find((o) => o.value === value.scAddress)
  })

  const [selectedProcedure, setSelectedProcedure] = useState<Option | undefined>(() => {
    if (value?.procedureId !== undefined) {
      return {
        label: value.procedureName ?? String(value.procedureId),
        value: String(value.procedureId)
      }
    }
    return undefined
  })

  // Sync when options load after initial render
  useEffect(() => {
    if (!selectedSc && scOptions.length > 0 && value?.scAddress) {
      setSelectedSc(scOptions.find((o) => o.value === value.scAddress))
    }
  }, [scOptions, value?.scAddress, selectedSc])

  const isScCategory = selectedCategory?.value === SC_VALUE

  // Level 3: Procedure options
  const procedureOptions = useMemo<Option[]>(() => {
    if (!selectedSc) return []
    const sc = smartContracts?.find((c) => c.address === selectedSc.value)
    if (!sc?.procedures?.length) return []
    return [
      { label: t('allProcedures'), value: ALL_PROCEDURES_VALUE },
      ...sc.procedures.map((p) => ({
        label: `${p.name} (${p.id})`,
        value: String(p.id)
      }))
    ]
  }, [selectedSc, smartContracts, t])

  const handleCategoryChange = useCallback(
    (option: Option) => {
      setSelectedCategory(option)
      setSelectedSc(undefined)
      setSelectedProcedure(undefined)
      if (option.value === STANDARD_VALUE) {
        onChange({ scLabel: option.label, isStandard: true })
      } else {
        // SC category selected but no specific SC yet — clear filter value
        onChange(undefined)
      }
    },
    [onChange]
  )

  const handleScChange = useCallback(
    (option: Option) => {
      setSelectedSc(option)
      setSelectedProcedure(undefined)
      const sc = smartContracts?.find((c) => c.address === option.value)
      onChange({
        scAddress: option.value,
        scLabel: sc?.label || sc?.name || option.label
      })
    },
    [smartContracts, onChange]
  )

  const handleProcedureChange = useCallback(
    (option: Option) => {
      const isAll = option.value === ALL_PROCEDURES_VALUE
      setSelectedProcedure(isAll ? undefined : option)
      if (!selectedSc) return
      const sc = smartContracts?.find((c) => c.address === selectedSc.value)
      onChange({
        scAddress: selectedSc.value,
        scLabel: sc?.label || sc?.name || selectedSc.label,
        ...(isAll
          ? {}
          : {
              procedureId: Number(option.value),
              procedureName: sc?.procedures?.find((p) => p.id === Number(option.value))?.name
            })
      })
    },
    [selectedSc, smartContracts, onChange]
  )

  const hasSelection = selectedCategory?.value === STANDARD_VALUE || !!selectedSc

  return (
    <div className="space-y-12">
      <Select
        label={t('txType')}
        options={categoryOptions}
        onSelect={handleCategoryChange}
        defaultValue={selectedCategory}
        showLabel
        size="sm"
      />

      {isScCategory && (
        <Select
          label={t('selectContract')}
          options={scOptions}
          onSelect={handleScChange}
          defaultValue={selectedSc}
          showLabel
          size="sm"
        />
      )}

      {isScCategory && selectedSc && procedureOptions.length > 0 && (
        <Select
          label={t('allProcedures')}
          options={procedureOptions}
          onSelect={handleProcedureChange}
          defaultValue={
            selectedProcedure || { label: t('allProcedures'), value: ALL_PROCEDURES_VALUE }
          }
          showLabel={false}
          size="sm"
        />
      )}

      {showApplyButton && (
        <button
          type="button"
          onClick={onApply}
          disabled={!hasSelection}
          className="w-full rounded bg-primary-30 px-10 py-6 text-xs text-primary-80 hover:bg-primary-40 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-primary-30"
        >
          {t('filterButton')}
        </button>
      )}
    </div>
  )
}
