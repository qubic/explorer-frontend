import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

/**
 * Auto-corrects the URL page param when it exceeds the available pages.
 * Handles edge cases like direct URL entry with stale page params.
 */
export function usePageAutoCorrect(hasData: boolean, total: number, pageSize: number): void {
  const [searchParams, setSearchParams] = useSearchParams()

  const rawPage = searchParams.get('page')
  const page = rawPage ? parseInt(rawPage, 10) || 1 : 1
  const maxPage = Math.max(1, Math.ceil(total / pageSize))

  useEffect(() => {
    if (hasData && page > maxPage) {
      setSearchParams(
        (prev) => {
          prev.set('page', '1')
          return prev
        },
        { replace: true }
      )
    }
  }, [hasData, page, maxPage, setSearchParams])
}
