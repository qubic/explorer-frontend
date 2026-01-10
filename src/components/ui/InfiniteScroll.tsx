import type React from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { ArrowUpIcon } from '@app/assets/icons'
import { Alert } from '@app/components/ui'
import { DotsLoader } from '@app/components/ui/loaders'
import { clsxTwMerge } from '@app/utils'

type InfiniteScrollProps<T> = Readonly<{
  items: T[] // Array of items to display
  loadMore: () => void | Promise<void> // Function to load more items
  hasMore: boolean // Boolean indicating if more items can be loaded
  renderItem: (item: T, index: number) => React.ReactNode // Render function for each item
  loader?: React.ReactNode // Custom loader component
  endMessage?: React.ReactNode // Message to display when all items are loaded
  threshold?: number // Threshold to trigger load more function
  className?: string // Custom class name for list container
  isLoading?: boolean // Boolean indicating if loading (can be controlled externally)
  error?: string | null // Error message to display (can be controlled externally)
  replaceContentOnLoading?: boolean // Boolean indicating if content should be replaced on loading
  replaceContentOnError?: boolean // Boolean indicating if content should be replaced on error
}>

export default function InfiniteScroll<T>({
  items,
  loadMore,
  hasMore,
  renderItem,
  loader = <DotsLoader />,
  endMessage,
  threshold = 0,
  isLoading: externalIsLoading,
  className,
  error: externalError,
  replaceContentOnLoading = false,
  replaceContentOnError = false
}: InfiniteScrollProps<T>) {
  const observer = useRef<IntersectionObserver | null>(null)
  const [internalIsLoading, setInternalIsLoading] = useState<boolean>(false)
  const [internalError, setInternalError] = useState<string | null>(null)
  const [showScrollToTop, setShowScrollToTop] = useState<boolean>(false)

  const isLoading = externalIsLoading ?? internalIsLoading
  const error = externalError ?? internalError

  const handleLoadMore = useCallback(async () => {
    try {
      setInternalIsLoading(true)
      setInternalError(null)
      await loadMore()
    } catch (err) {
      setInternalError('Failed to load more items.')
    } finally {
      setInternalIsLoading(false)
    }
  }, [loadMore])

  const lastElementRef = useCallback(
    (node: HTMLElement | null) => {
      if (observer.current) observer.current.disconnect()

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore && !isLoading) {
            handleLoadMore()
          }
        },
        { rootMargin: `${threshold}px` }
      )

      if (node) observer.current.observe(node)
    },
    [handleLoadMore, hasMore, isLoading, threshold]
  )

  const handleScrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleScroll = useCallback(() => {
    if (window.scrollY > window.innerHeight) {
      setShowScrollToTop(true)
    } else {
      setShowScrollToTop(false)
    }
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const renderStatus = useCallback(() => {
    if (error)
      return (
        <Alert variant="error" className="my-12">
          {error}
        </Alert>
      )
    if (isLoading) return loader
    if (!hasMore && endMessage) return endMessage
    return null
  }, [error, isLoading, loader, hasMore, endMessage])

  const renderContent = useCallback(() => {
    if ((replaceContentOnLoading && isLoading) || (replaceContentOnError && error)) {
      return renderStatus()
    }

    return (
      <>
        <ul className={clsxTwMerge('space-y-12', className)}>
          {items.map((item, index) => (
            <li
              key={JSON.stringify(item)}
              ref={index === items.length - 1 ? lastElementRef : undefined}
            >
              {renderItem(item, index)}
            </li>
          ))}
        </ul>

        {renderStatus()}
      </>
    )
  }, [
    isLoading,
    items,
    renderItem,
    className,
    lastElementRef,
    renderStatus,
    replaceContentOnLoading,
    replaceContentOnError,
    error
  ])

  return (
    <div className="relative">
      {renderContent()}

      {showScrollToTop && (
        <button
          type="button"
          aria-label="Scroll to top"
          onClick={handleScrollToTop}
          className="fixed bottom-16 right-16 rounded-full border border-gray-60 bg-background p-12 text-gray-60 shadow-lg transition duration-300 hover:border-gray-50 hover:text-muted-foreground"
        >
          <ArrowUpIcon className="size-24" />
        </button>
      )}
    </div>
  )
}
