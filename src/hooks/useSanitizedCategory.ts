import { useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

import { parseCategoryParam } from '@app/store/apis/events'

export function useSanitizedCategory(): number | undefined {
  const [searchParams, setSearchParams] = useSearchParams()

  const rawCategory = searchParams.get('category')
  const category = useMemo(() => parseCategoryParam(rawCategory), [rawCategory])

  useEffect(() => {
    if (rawCategory === null) return
    if (category === undefined) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.delete('category')
          return next
        },
        { replace: true }
      )
    }
  }, [rawCategory, category, setSearchParams])

  return category
}
