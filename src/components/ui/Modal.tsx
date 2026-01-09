import { clsxTwMerge } from '@app/utils'
import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

type ModalProps = {
  id: string
  isOpen: boolean
  children: React.ReactNode
  className?: string
  closeOnOutsideClick?: boolean
  onClose?: () => void
}

function ModalOverlayWrapper({
  id,
  children,
  className,
  closeOnOutsideClick,
  onClose
}: Omit<ModalProps, 'isOpen'>) {
  const modalWrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalWrapperRef.current && !modalWrapperRef.current.contains(event.target as Node)) {
        if (onClose) {
          onClose()
        }
      }
    }

    if (closeOnOutsideClick) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      if (closeOnOutsideClick) {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [closeOnOutsideClick, onClose])

  return (
    <>
      <div
        id={id}
        className={clsxTwMerge('fixed inset-x-0 z-9999', className)}
        role="dialog"
        aria-labelledby={`${id}-title`}
        aria-modal="true"
        ref={modalWrapperRef}
      >
        {children}
      </div>
      <div className="fixed inset-0 z-999 bg-primary-80 bg-opacity-80" />
    </>
  )
}

export default function Modal({
  id,
  isOpen,
  children,
  className,
  closeOnOutsideClick,
  onClose
}: ModalProps) {
  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      // Allow scrolling inside elements with overflow-y-auto or overflow-auto
      let target = e.target as HTMLElement | null
      while (target && target !== document.body) {
        const style = window.getComputedStyle(target)
        const overflowY = style.getPropertyValue('overflow-y')
        if (overflowY === 'auto' || overflowY === 'scroll') {
          // Check if the element is actually scrollable (has overflow content)
          if (target.scrollHeight > target.clientHeight) {
            return // Allow scroll inside scrollable container
          }
        }
        target = target.parentElement
      }
      // Prevent scroll on background
      e.preventDefault()
    }

    if (isOpen) {
      // Disable scrolling on body (desktop)
      document.body.classList.add('overflow-hidden')

      // Disable touch scrolling (mobile) except inside scrollable areas
      document.addEventListener('touchmove', handleTouchMove, { passive: false })
    }

    return () => {
      // Enable scrolling on body (desktop)
      document.body.classList.remove('overflow-hidden')

      // Enable touch scrolling (mobile)
      document.removeEventListener('touchmove', handleTouchMove)
    }
  }, [isOpen])

  return isOpen
    ? createPortal(
        <ModalOverlayWrapper
          id={id}
          className={className}
          closeOnOutsideClick={closeOnOutsideClick}
          onClose={onClose}
        >
          {children}
        </ModalOverlayWrapper>,
        document.getElementById('modal-root') as HTMLElement
      )
    : null
}
