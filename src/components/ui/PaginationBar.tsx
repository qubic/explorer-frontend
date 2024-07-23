import { ArrowLeftIcon, ArrowRightIcon } from '@app/assets/icons'
import { clsxTwMerge } from '@app/utils'
import { useCallback } from 'react'

type Props = {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
}

const generatePageRange = (start: number, end: number) =>
  Array.from({ length: end - start + 1 }, (_, index) => start + index)

export default function PaginationBar({ pageCount, page, onPageChange }: Props) {
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
              'h-32 w-32 px-6 font-sans text-center text-sm rounded-4 content-center text-gray-50',
              pageNumber === page
                ? 'bg-primary-40 text-primary-60 hover:bg-primary-70'
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
    <nav className="flex items-center justify-between px-4 sm:px-0">
      <button
        type="button"
        className="flex flex-1"
        aria-label="Previous Page"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
      >
        <ArrowLeftIcon
          aria-hidden="true"
          className={clsxTwMerge('h-20 w-20', page === 1 && 'opacity-40 cursor-not-allowed')}
        />
      </button>
      <div className="hidden sm:flex gap-6">{renderPageButtons(false)}</div>
      <div className="flex sm:hidden gap-6">{renderPageButtons(true)}</div>
      <button
        type="button"
        className="flex flex-1 justify-end"
        aria-label="Next Page"
        onClick={() => onPageChange(page + 1)}
        disabled={page === pageCount}
      >
        <ArrowRightIcon
          aria-hidden="true"
          className={clsxTwMerge(
            'h-20 w-20',
            page === pageCount && 'opacity-40 cursor-not-allowed'
          )}
        />
      </button>
    </nav>
  )
}
