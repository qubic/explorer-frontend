import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from 'react'

// ============================================================================
// LOCAL FILTER SYNC HOOK
// ============================================================================

/**
 * Hook to sync local filter state with active filters when modal opens.
 * Also resets validation errors on open.
 *
 * @param isOpen - Whether the modal is open
 * @param activeFilters - The active filters from parent
 * @returns [localFilters, setLocalFilters, validationErrors, setValidationErrors]
 */
export function useLocalFilterSync<T extends object>(
  isOpen: boolean,
  activeFilters: T
): [
  T,
  Dispatch<SetStateAction<T>>,
  Record<string, string | null>,
  Dispatch<SetStateAction<Record<string, string | null>>>
] {
  const [localFilters, setLocalFilters] = useState<T>(activeFilters)
  const [validationErrors, setValidationErrors] = useState<Record<string, string | null>>({})

  useEffect(() => {
    if (isOpen) {
      setLocalFilters(activeFilters)
      setValidationErrors({})
    }
  }, [isOpen, activeFilters])

  return [localFilters, setLocalFilters, validationErrors, setValidationErrors]
}

// ============================================================================
// AMOUNT PRESET HANDLER HOOK
// ============================================================================

type AmountRange = {
  start?: string
  end?: string
  presetKey?: string
}

type FiltersWithAmount = {
  amountRange?: AmountRange
}

type AmountPreset = {
  labelKey: string
  start?: string
  end?: string
}

/**
 * Hook to handle amount preset selection.
 * Returns a callback that applies the preset and closes the dropdown.
 *
 * @param activeFilters - Current active filters
 * @param onApplyFilters - Callback to apply new filters
 * @param setLocalFilters - Setter for local filter state
 * @param setOpenDropdown - Setter to close dropdown (optional, for desktop)
 */
export function useAmountPresetHandler<T extends FiltersWithAmount>(
  activeFilters: T,
  onApplyFilters: (filters: T) => void,
  setLocalFilters: Dispatch<SetStateAction<T>>,
  setOpenDropdown?: Dispatch<SetStateAction<string | null>>
): (preset: AmountPreset) => void {
  return useCallback(
    (preset: AmountPreset) => {
      const newFilters = {
        ...activeFilters,
        amountRange: { start: preset.start, end: preset.end, presetKey: preset.labelKey }
      } as T
      onApplyFilters(newFilters)
      setLocalFilters(newFilters)
      setOpenDropdown?.(null)
    },
    [activeFilters, onApplyFilters, setLocalFilters, setOpenDropdown]
  )
}

// ============================================================================
// CLEAR FILTER HANDLER FACTORY
// ============================================================================

/**
 * Creates a handler to clear a specific filter field.
 *
 * @param filterKey - The key of the filter to clear
 * @param activeFilters - Current active filters
 * @param onApplyFilters - Callback to apply new filters
 * @param setLocalFilters - Setter for local filter state
 */
export function useClearFilterHandler<T extends object, K extends keyof T>(
  filterKey: K,
  activeFilters: T,
  onApplyFilters: (filters: T) => void,
  setLocalFilters: Dispatch<SetStateAction<T>>
): () => void {
  return useCallback(() => {
    const newFilters = { ...activeFilters, [filterKey]: undefined }
    onApplyFilters(newFilters)
    setLocalFilters(newFilters)
  }, [activeFilters, onApplyFilters, setLocalFilters, filterKey])
}

// ============================================================================
// VALIDATION SCROLL HELPER
// ============================================================================

/**
 * Scrolls to the first validation error element.
 * @param firstErrorId - The ID of the element to scroll to
 */
export function scrollToValidationError(firstErrorId: string | null): void {
  if (firstErrorId) {
    setTimeout(() => {
      document.getElementById(firstErrorId)?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }
}

// ============================================================================
// RANGE LABEL FORMATTING
// ============================================================================

type RangeValue = {
  start?: string
  end?: string
}

type FormatValueFn = (value: string) => string

/**
 * Formats a range filter label for display.
 * Handles the common pattern: "Label: start - end" or "Label: >= start" or "Label: <= end"
 *
 * @param label - The base label (e.g., "Amount", "Input Type")
 * @param range - The range value with optional start/end
 * @param formatValue - Optional function to format values (e.g., for number formatting)
 * @returns Formatted label string
 */
export function formatRangeLabel(
  label: string,
  range: RangeValue | undefined,
  formatValue: FormatValueFn = (v) => v
): string {
  if (!range?.start && !range?.end) return label

  const { start, end } = range
  if (start && end) return `${label}: ${formatValue(start)} - ${formatValue(end)}`
  if (start) return `${label}: >= ${formatValue(start)}`
  if (end) return `${label}: <= ${formatValue(end)}`
  return label
}
