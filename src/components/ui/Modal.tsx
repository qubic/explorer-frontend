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
        className={clsxTwMerge('fixed inset-x-0 z-99', className)}
        role="dialog"
        aria-labelledby={`${id}-title`}
        aria-modal="true"
        ref={modalWrapperRef}
      >
        {children}
      </div>
      <div className="fixed inset-0 z-50 bg-primary-80 bg-opacity-80" />
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
    if (isOpen) {
      document.body.classList.add('overflow-hidden')
    }

    return () => {
      document.body.classList.remove('overflow-hidden')
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
