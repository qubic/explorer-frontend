import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

import { validatePageSize } from '@app/constants'

export function useValidatedPageSize(enabled = true): number {
  const [searchParams, setSearchParams] = useSearchParams()

  const rawPageSize = searchParams.get('pageSize')
  const pageSize = enabled ? validatePageSize(rawPageSize) : validatePageSize(null)

  useEffect(() => {
    if (enabled && rawPageSize !== null && String(pageSize) !== rawPageSize) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.set('pageSize', String(pageSize))
          return next
        },
        { replace: true }
      )
    }
  }, [enabled, rawPageSize, pageSize, setSearchParams])

  return pageSize
}
