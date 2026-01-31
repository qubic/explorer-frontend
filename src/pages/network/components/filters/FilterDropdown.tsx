import { useLayoutEffect, useRef, useState } from 'react'

import { ChevronDownIcon, XmarkIcon } from '@app/assets/icons'
import DropdownMenu from '@app/components/ui/DropdownMenu'
import { clsxTwMerge } from '@app/utils'

type DropdownAlignment = 'left' | 'center' | 'right'

type Props = {
  label: string
  isActive: boolean
  children: React.ReactNode
  show: boolean
  onToggle: () => void
  onClear?: () => void
  contentClassName?: string
  allowFullWidth?: boolean
}

export default function FilterDropdown({
  label,
  isActive,
  children,
  show,
  onToggle,
  onClear,
  contentClassName,
  allowFullWidth = false
}: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [alignment, setAlignment] = useState<DropdownAlignment>('left')
  const [isPositioned, setIsPositioned] = useState(false)

  // Calculate optimal alignment after dropdown renders
  useLayoutEffect(() => {
    if (!show) {
      setIsPositioned(false)
      return () => {} // Always return cleanup function for consistency
    }

    // Use requestAnimationFrame to ensure DOM has been laid out
    const rafId = requestAnimationFrame(() => {
      if (!wrapperRef.current || !triggerRef.current) return

      // Query for the dropdown content element inside the wrapper
      const contentEl = wrapperRef.current.querySelector('[role="menu"]') as HTMLElement
      if (!contentEl) return

      const buttonRect = triggerRef.current.getBoundingClientRect()
      const contentWidth = contentEl.offsetWidth
      const viewportWidth = window.innerWidth
      const margin = 16

      // Calculate where dropdown would be with left alignment
      const leftAlignedRight = buttonRect.left + contentWidth
      // Calculate where dropdown would be with right alignment
      const rightAlignedLeft = buttonRect.right - contentWidth

      // Check if left alignment would overflow right edge
      const wouldOverflowRight = leftAlignedRight > viewportWidth - margin
      // Check if right alignment would overflow left edge
      const wouldOverflowLeft = rightAlignedLeft < margin

      if (wouldOverflowRight && !wouldOverflowLeft) {
        setAlignment('right')
      } else if (!wouldOverflowRight) {
        setAlignment('left')
      } else {
        // Both overflow - center it
        setAlignment('center')
      }

      setIsPositioned(true)
    })

    return () => cancelAnimationFrame(rafId)
  }, [show])

  const handleClearClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onClear?.()
    // Close the dropdown after clearing
    if (show) {
      onToggle()
    }
  }

  const getAlignmentClasses = () => {
    switch (alignment) {
      case 'right':
        return 'ltr:right-0 ltr:left-auto rtl:left-0 rtl:right-auto'
      case 'center':
        return 'ltr:left-1/2 ltr:right-auto ltr:-translate-x-1/2 rtl:right-1/2 rtl:left-auto rtl:translate-x-1/2'
      default:
        return 'ltr:left-0 ltr:right-auto rtl:right-0 rtl:left-auto'
    }
  }

  return (
    <div ref={wrapperRef} className="relative">
      <DropdownMenu show={show} onToggle={onToggle}>
        <DropdownMenu.Trigger className="flex items-center gap-4">
          <button
            ref={triggerRef}
            type="button"
            className={clsxTwMerge(
              'flex shrink-0 items-center gap-4 rounded border px-8 py-6 text-xs transition-colors sm:gap-6 sm:px-10',
              isActive
                ? 'border-primary-30 bg-primary-60 text-primary-30'
                : 'border-primary-60 text-gray-50 hover:border-primary-50 hover:text-white'
            )}
          >
            <span
              className={clsxTwMerge(!allowFullWidth && 'max-w-[120px] truncate sm:max-w-[200px]')}
            >
              {label}
            </span>
            {isActive && onClear ? (
              <button
                type="button"
                onClick={handleClearClick}
                className="flex items-center justify-center rounded-full p-2 hover:bg-primary-50"
                aria-label="Clear filter"
              >
                <XmarkIcon className="h-10 w-10" />
              </button>
            ) : (
              <ChevronDownIcon
                className={clsxTwMerge('h-12 w-12 transition-transform', show && 'rotate-180')}
              />
            )}
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content
          className={clsxTwMerge(
            'min-w-[200px] max-w-[calc(100vw-32px)] p-12 transition-none',
            getAlignmentClasses(),
            !isPositioned && 'invisible',
            contentClassName
          )}
        >
          {children}
        </DropdownMenu.Content>
      </DropdownMenu>
    </div>
  )
}
