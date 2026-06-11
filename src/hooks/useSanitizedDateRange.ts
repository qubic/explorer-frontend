import { useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

import { parseDateRange, type DateRangeValue } from '@app/pages/network/utils/eventFilterUtils'

/**
 * Parses the date range URL params (`datePresetDays`, `dateStart`, `dateEnd`)
 * and actively removes any that fail validation so the URL never carries
 * silent garbage that the rest of the app would have to ignore.
 */
export function useSanitizedDateRange(): DateRangeValue | undefined {
  const [searchParams, setSearchParams] = useSearchParams()
  const presetRaw = searchParams.get('datePresetDays')
  const startRaw = searchParams.get('dateStart')
  const endRaw = searchParams.get('dateEnd')

  const dateRange = useMemo(() => parseDateRange(searchParams), [searchParams])

  useEffect(() => {
    // A param needs removing if it's in the URL but didn't survive parseDateRange —
    // either because it was malformed, or because a valid preset shadowed the custom
    // start/end pair (preset wins, so the URL should reflect that).
    const shouldRemovePreset = presetRaw !== null && dateRange?.presetDays === undefined
    const shouldRemoveStart = startRaw !== null && dateRange?.start === undefined
    const shouldRemoveEnd = endRaw !== null && dateRange?.end === undefined

    if (!shouldRemovePreset && !shouldRemoveStart && !shouldRemoveEnd) return

    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (shouldRemovePreset) next.delete('datePresetDays')
        if (shouldRemoveStart) next.delete('dateStart')
        if (shouldRemoveEnd) next.delete('dateEnd')
        return next
      },
      { replace: true }
    )
  }, [presetRaw, startRaw, endRaw, dateRange, setSearchParams])

  return dateRange
}
