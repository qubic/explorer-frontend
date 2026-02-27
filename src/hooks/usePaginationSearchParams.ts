import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

/**
 * Provides pagination handlers that sync with URL search params.
 * Replaces the copy-pasted handlePageChange / handlePageSizeChange callbacks
 * used across multiple pages.
 */
export function usePaginationSearchParams() {
  const [, setSearchParams] = useSearchParams()

  const handlePageChange = useCallback(
    (value: number) => {
      setSearchParams((prev) => ({
        ...Object.fromEntries(prev.entries()),
        page: value.toString()
      }))
    },
    [setSearchParams]
  )

  const handlePageSizeChange = useCallback(
    (option: { value: string }) => {
      setSearchParams((prev) => ({
        ...Object.fromEntries(prev.entries()),
        pageSize: option.value,
        page: '1'
      }))
    },
    [setSearchParams]
  )

  const resetPage = useCallback(() => {
    setSearchParams((prev) => ({
      ...Object.fromEntries(prev.entries()),
      page: '1'
    }))
  }, [setSearchParams])

  return { handlePageChange, handlePageSizeChange, resetPage }
}
