import { ArrowLeftIcon, ArrowRightIcon } from '@app/assets/icons'
import { clsxTwMerge } from '@app/utils'
import { useCallback } from 'react'

type Props = {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
  className?: string
}

const generatePageRange = (start: number, end: number) =>
  Array.from({ length: end - start + 1 }, (_, index) => start + index)

const transitionClasses = 'transition duration-100 ease-in-out'
const arrowButtonClasses = 'flex size-32 items-center justify-center rounded-4'

export default function PaginationBar({ pageCount, page, onPageChange, className }: Props) {
  const getPaginationBar = useCallback(
    (isMobile: boolean) => {
      const rangeSize = isMobile ? 3 : 5
      const startSize = isMobile ? 3 : 6
      const endSize = isMobile ? 2 : 4
      const middlePages = isMobile ? [page] : [page - 1, page, page + 1]

      if (pageCount <= startSize) {
        return generatePageRange(1, pageCount)
      }

      if (page < rangeSize) {
        return [...generatePageRange(1, rangeSize), '...', pageCount]
      }

      if (page > pageCount - endSize) {
        return [1, '...', ...generatePageRange(pageCount - endSize, pageCount)]
      }

      return [1, '...', ...middlePages, '...', pageCount]
    },
    [page, pageCount]
  )

  const renderPageButtons = useCallback(
    (isMobile: boolean) =>
      getPaginationBar(isMobile).map((pageNumber, index) =>
        typeof pageNumber === 'number' ? (
          <button
            type="button"
            key={pageNumber}
            className={clsxTwMerge(
              'h-32 min-w-32 rounded-4 px-6 text-center font-sans text-sm text-gray-50',
              transitionClasses,
              pageNumber === page
                ? 'bg-primary-30 text-primary-70 hover:bg-primary-50'
                : 'hover:bg-gray-60/40'
            )}
            onClick={() => onPageChange(pageNumber)}
          >
            {pageNumber}
          </button>
        ) : (
          <span
            key={`ellipsis-${String(index)}`}
            className="inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm text-gray-50"
          >
            ...
          </span>
        )
      ),
    [page, getPaginationBar, onPageChange]
  )

  return (
    <nav className={clsxTwMerge('flex items-center justify-between px-4 sm:px-0', className)}>
      <button
        type="button"
        className={clsxTwMerge(
          arrowButtonClasses,
          transitionClasses,
          page <= 1 ? 'cursor-not-allowed opacity-40' : 'hover:bg-primary-60'
        )}
        aria-label="Previous Page"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
      >
        <ArrowLeftIcon aria-hidden="true" className="size-20" />
      </button>
      <div className="hidden gap-6 sm:flex">{renderPageButtons(false)}</div>
      <div className="flex gap-6 sm:hidden">{renderPageButtons(true)}</div>
      <button
        type="button"
        className={clsxTwMerge(
          arrowButtonClasses,
          transitionClasses,
          page === pageCount ? 'cursor-not-allowed opacity-40' : 'hover:bg-primary-60'
        )}
        aria-label="Next Page"
        onClick={() => onPageChange(page + 1)}
        disabled={page === pageCount}
      >
        <ArrowRightIcon aria-hidden="true" className="size-20" />
      </button>
    </nav>
  )
}
