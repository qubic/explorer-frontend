import { ArrowLeftIcon, ArrowRightIcon } from '@app/assets/icons'
import { clsxTwMerge } from '@app/utils'
import { useCallback, useMemo } from 'react'

type Props = {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
  className?: string
}

type Size = 'xs' | 'sm' | 'md'

type PaginationSizeConfig = {
  rangeSize: number
  startSize: number
  endSize: number
  middlePages: number[]
}

const getPaginationSizeConfig = (size: Size, page: number): PaginationSizeConfig => {
  switch (size) {
    case 'xs':
      return {
        rangeSize: 1,
        startSize: 1,
        endSize: 0,
        middlePages: [page]
      }
    case 'sm':
      return {
        rangeSize: 3,
        startSize: 3,
        endSize: 2,
        middlePages: [page]
      }
    case 'md':
    default:
      return {
        rangeSize: 5,
        startSize: 6,
        endSize: 4,
        middlePages: [page - 1, page, page + 1]
      }
  }
}

const generatePageRange = (start: number, end: number) =>
  Array.from({ length: end - start + 1 }, (_, index) => start + index)

const transitionClasses = 'transition duration-100 ease-in-out'
const arrowButtonClasses = 'flex size-32 items-center justify-center rounded-4'

export default function PaginationBar({ pageCount, page, onPageChange, className }: Props) {
  const zeroOrNegativePage = useMemo(() => page <= 0, [page])

  const getPaginationBar = useCallback(
    (size: Size) => {
      const { rangeSize, startSize, endSize, middlePages } = getPaginationSizeConfig(size, page)

      if (zeroOrNegativePage) {
        return [1]
      }

      if (pageCount <= startSize) {
        return generatePageRange(1, pageCount)
      }

      if (size === 'xs') {
        return [page]
      }

      if (page < rangeSize) {
        return [...generatePageRange(1, rangeSize), '...', pageCount]
      }

      if (page > pageCount - endSize) {
        return [1, '...', ...generatePageRange(pageCount - endSize, pageCount)]
      }

      return [1, '...', ...middlePages, '...', pageCount]
    },
    [page, pageCount, zeroOrNegativePage]
  )

  const renderPageButtons = useCallback(
    (size: Size) =>
      getPaginationBar(size).map((pageNumber, index) =>
        typeof pageNumber === 'number' ? (
          <button
            type="button"
            key={pageNumber}
            className={clsxTwMerge(
              'h-32 min-w-32 rounded-4 px-6 text-center font-sans text-sm text-gray-50',
              transitionClasses,
              pageNumber === page || zeroOrNegativePage
                ? 'bg-primary-30 text-primary-80 hover:bg-primary-50'
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
    [getPaginationBar, page, zeroOrNegativePage, onPageChange]
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
        <ArrowLeftIcon aria-hidden="true" className="size-20 rtl:rotate-180 rtl:transform" />
      </button>
      <div className="flex gap-6 xs:hidden">{renderPageButtons('xs')}</div>
      <div className="hidden gap-6 xs:flex sm:hidden">{renderPageButtons('sm')}</div>
      <div className="hidden gap-6 sm:flex">{renderPageButtons('md')}</div>
      <button
        type="button"
        className={clsxTwMerge(
          arrowButtonClasses,
          transitionClasses,
          page >= pageCount ? 'cursor-not-allowed opacity-40' : 'hover:bg-primary-60'
        )}
        aria-label="Next Page"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= pageCount}
      >
        <ArrowRightIcon aria-hidden="true" className="size-20 rtl:rotate-180 rtl:transform" />
      </button>
    </nav>
  )
}
