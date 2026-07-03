import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

import { validatePage } from '@app/constants'

export function useValidatedPage(enabled = true, paramName = 'page'): number {
  const [searchParams, setSearchParams] = useSearchParams()

  const rawPage = searchParams.get(paramName)
  const page = enabled ? validatePage(rawPage) : 1

  useEffect(() => {
    if (enabled && rawPage !== null && String(page) !== rawPage) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.set(paramName, String(page))
          return next
        },
        { replace: true }
      )
    }
  }, [enabled, rawPage, page, paramName, setSearchParams])

  return page
}
