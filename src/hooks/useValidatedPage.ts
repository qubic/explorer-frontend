import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

import { validatePage } from '@app/constants'

export function useValidatedPage(enabled = true): number {
  const [searchParams, setSearchParams] = useSearchParams()

  const rawPage = searchParams.get('page')
  const page = enabled ? validatePage(rawPage) : 1

  useEffect(() => {
    if (enabled && rawPage !== null && String(page) !== rawPage) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.set('page', String(page))
          return next
        },
        { replace: true }
      )
    }
  }, [enabled, rawPage, page, setSearchParams])

  return page
}
