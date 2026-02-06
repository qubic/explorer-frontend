import type { ReactNode } from 'react'

import { Modal } from '@app/components/ui'
import MobileFiltersApplyButton from './MobileFiltersApplyButton'
import MobileFiltersHeader from './MobileFiltersHeader'

type Props = {
  id: string
  isOpen: boolean
  onClose: () => void
  onApply: () => void
  children: ReactNode
}

export default function MobileFiltersModalWrapper({
  id,
  isOpen,
  onClose,
  onApply,
  children
}: Props) {
  return (
    <Modal
      id={id}
      isOpen={isOpen}
      onClose={onClose}
      closeOnOutsideClick
      className="top-0 h-full sm:hidden"
    >
      <div className="flex h-full flex-col bg-primary-70">
        <MobileFiltersHeader onClose={onClose} />

        <div className="flex-1 overflow-y-auto p-16">
          <div className="space-y-20">{children}</div>
        </div>

        <MobileFiltersApplyButton onClick={onApply} />
      </div>
    </Modal>
  )
}
