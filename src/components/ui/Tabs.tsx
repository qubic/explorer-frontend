import { clsxTwMerge } from '@app/utils'
import type { ReactElement, ReactNode } from 'react'
import React, { Children, isValidElement, useState } from 'react'

type BaseComponentProps = {
  children: ReactNode
  className?: string
}

type TabsPanelProps = BaseComponentProps & {
  isSelected?: boolean
}

type TabComponentProps = BaseComponentProps & {
  isSelected?: boolean
  onClick?: () => void
}

interface TabsProps extends BaseComponentProps {
  onChange?: (selectedIndex: number) => void
  selectedIndex?: number
}

interface TabsListProps extends BaseComponentProps {
  onTabClick?: (index: number) => void
  currentIndex?: number
}

interface TabsPanelsProps extends BaseComponentProps {
  currentIndex?: number
}

export default function Tabs({ children, className, onChange, selectedIndex = 0 }: TabsProps) {
  const [currentIndex, setCurrentIndex] = useState(selectedIndex)

  const handleTabClick = (index: number) => {
    setCurrentIndex(index)
    onChange?.(index)
  }

  const list = Children.toArray(children).find(
    (child) => isValidElement(child) && child.type === Tabs.List
  ) as ReactElement<TabsListProps> | undefined

  const panels = Children.toArray(children).find(
    (child) => isValidElement(child) && child.type === Tabs.Panels
  ) as ReactElement<TabsPanelsProps> | undefined

  return (
    <div className={clsxTwMerge('tabs-container', className)}>
      {list && React.cloneElement(list, { onTabClick: handleTabClick, currentIndex })}
      {panels && React.cloneElement(panels, { currentIndex })}
    </div>
  )
}

Tabs.List = function TabsList({ children, className, onTabClick, currentIndex }: TabsListProps) {
  return (
    <div className={clsxTwMerge('border-b-1 border-gray-70', className)}>
      <nav aria-label="Tabs" className="flex space-x-2">
        {Children.map(children, (child, index) =>
          isValidElement<TabComponentProps>(child)
            ? React.cloneElement(child, {
                onClick: onTabClick ? () => onTabClick(index) : undefined,
                isSelected: index === currentIndex
              })
            : child
        )}
      </nav>
    </div>
  )
}

Tabs.Tab = function TabsTab({ children, className, isSelected, onClick }: TabComponentProps) {
  return (
    <button
      type="button"
      className={clsxTwMerge(
        'whitespace-nowrap border-b-2 px-16 py-12 font-space text-sm font-medium transition-all duration-300',
        isSelected
          ? 'border-primary-50 text-primary-50'
          : 'border-transparent text-gray-500 hover:border-gray-60 hover:text-gray-700',
        className
      )}
      onClick={onClick}
      aria-current={isSelected ? 'page' : undefined}
    >
      {children}
    </button>
  )
}

Tabs.Panels = function TabsPanels({ children, className, currentIndex }: TabsPanelsProps) {
  return (
    <div className={clsxTwMerge('py-24', className)}>
      {Children.map(children, (child, index) =>
        isValidElement<TabsPanelProps>(child)
          ? React.cloneElement(child, { isSelected: index === currentIndex })
          : child
      )}
    </div>
  )
}

Tabs.Panel = function TabsPanel({ children, isSelected, className }: TabsPanelProps) {
  if (!isSelected) return null

  return <div className={className}>{children}</div>
}
