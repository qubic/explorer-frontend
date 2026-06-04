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
    const hasInvalidPreset = presetRaw !== null && dateRange?.presetDays === undefined
    const hasInvalidStart = startRaw !== null && dateRange?.start === undefined
    const hasInvalidEnd = endRaw !== null && dateRange?.end === undefined

    if (!hasInvalidPreset && !hasInvalidStart && !hasInvalidEnd) return

    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (hasInvalidPreset) next.delete('datePresetDays')
        if (hasInvalidStart) next.delete('dateStart')
        if (hasInvalidEnd) next.delete('dateEnd')
        return next
      },
      { replace: true }
    )
  }, [presetRaw, startRaw, endRaw, dateRange, setSearchParams])

  return dateRange
}
