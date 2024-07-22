import { clsxTwMerge } from '@app/utils'
import React, { ReactElement, ReactNode } from 'react'

interface DropdownMenuProps {
  children: ReactNode
  show?: boolean
  className?: string
}

interface DropdownMenuTriggerProps {
  children: ReactNode
  onToggle?: () => void
  className?: string
}

interface DropdownMenuOptionsProps {
  children: ReactNode
  className?: string
}

function DropdownMenu({ className, children, show }: DropdownMenuProps) {
  const trigger = React.Children.toArray(children).find(
    (child) => React.isValidElement(child) && child.type === DropdownMenu.Trigger
  ) as ReactElement

  const content = React.Children.toArray(children).find(
    (child) => React.isValidElement(child) && child.type === DropdownMenu.Content
  ) as ReactElement

  return (
    <div className={clsxTwMerge('relative flex text-left', className)}>
      {trigger}

      {show && content}
    </div>
  )
}

DropdownMenu.Trigger = function DropdownMenuTrigger({
  children,
  onToggle,
  className
}: DropdownMenuTriggerProps) {
  return (
    <button type="button" onClick={onToggle} className={className}>
      {children}
    </button>
  )
}

DropdownMenu.Content = function DropdownMenuContent({
  children,
  className
}: DropdownMenuOptionsProps) {
  return (
    <div
      className={clsxTwMerge(
        'origin-top-right absolute right-0 top-40 mt-2 w-fit rounded-md shadow-lg bg-gray-70 ring-1 ring-black ring-opacity-5 focus:outline-none transition duration-1000 ease-in-out',
        className
      )}
      role="menu"
      aria-orientation="vertical"
      aria-labelledby="dropdown-content"
    >
      {children}
    </div>
  )
}

export default DropdownMenu
