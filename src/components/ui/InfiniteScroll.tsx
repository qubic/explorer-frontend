import { clsxTwMerge } from '@app/utils'
import type React from 'react'
import { useCallback, useRef, useState } from 'react'
import { DotsLoader } from './loaders'

interface InfiniteScrollProps<T> {
  items: T[] // Array of items to display
  loadMore: () => void | Promise<void> // Function to load more items
  hasMore: boolean // Boolean indicating if more items can be loaded
  renderItem: (item: T, index: number) => React.ReactNode // Render function for each item
  loader?: React.ReactNode // Custom loader component
  endMessage?: React.ReactNode // Message to display when all items are loaded
  threshold?: number // Threshold to trigger load more function
  className?: string // Custom class name for list container
  isLoading?: boolean // Boolean indicating if loading (can be controlled externally)
}

export default function InfiniteScroll<T>({
  items,
  loadMore,
  hasMore,
  renderItem,
  loader = <DotsLoader />,
  endMessage,
  threshold = 0,
  isLoading: externalIsLoading,
  className
}: InfiniteScrollProps<T>) {
  const observer = useRef<IntersectionObserver | null>(null)
  const [internalIsLoading, setInternalIsLoading] = useState<boolean>(false)

  const isLoading = externalIsLoading !== undefined ? externalIsLoading : internalIsLoading

  const handleLoadMore = useCallback(() => {
    const result = loadMore()
    setInternalIsLoading(true)
    if (result instanceof Promise) {
      result.finally(() => setInternalIsLoading(false))
    } else {
      setTimeout(() => setInternalIsLoading(false), 1500)
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

  return (
    <div>
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
      {isLoading && loader}
      {!hasMore && !isLoading && endMessage}
    </div>
  )
}
