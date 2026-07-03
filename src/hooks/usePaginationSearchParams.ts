import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

/**
 * Provides pagination handlers that sync with URL search params.
 * Replaces the copy-pasted handlePageChange / handlePageSizeChange callbacks
 * used across multiple pages.
 */
export function usePaginationSearchParams(pageParam = 'page') {
  const [, setSearchParams] = useSearchParams()

  const handlePageChange = useCallback(
    (value: number) => {
      setSearchParams((prev) => ({
        ...Object.fromEntries(prev.entries()),
        [pageParam]: value.toString()
      }))
    },
    [pageParam, setSearchParams]
  )

  const handlePageSizeChange = useCallback(
    (option: { value: string }) => {
      setSearchParams((prev) => ({
        ...Object.fromEntries(prev.entries()),
        pageSize: option.value,
        [pageParam]: '1'
      }))
    },
    [pageParam, setSearchParams]
  )

  const resetPage = useCallback(() => {
    setSearchParams((prev) => ({
      ...Object.fromEntries(prev.entries()),
      [pageParam]: '1'
    }))
  }, [pageParam, setSearchParams])

  return { handlePageChange, handlePageSizeChange, resetPage }
}
