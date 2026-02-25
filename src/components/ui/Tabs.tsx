import { clsxTwMerge } from '@app/utils'
import type { ReactElement, ReactNode } from 'react'
import React, { Children, isValidElement, useEffect, useState } from 'react'

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
  variant?: 'default' | 'buttons'
}

interface TabsProps extends BaseComponentProps {
  onChange?: (selectedIndex: number) => void
  selectedIndex?: number
  variant?: 'default' | 'buttons'
}

interface TabsListProps extends BaseComponentProps {
  onTabClick?: (index: number) => void
  currentIndex?: number
  variant?: 'default' | 'buttons'
}

interface TabsPanelsProps extends BaseComponentProps {
  currentIndex?: number
}

export default function Tabs({
  children,
  className,
  onChange,
  selectedIndex = 0,
  variant = 'default'
}: TabsProps) {
  const [currentIndex, setCurrentIndex] = useState(selectedIndex)

  useEffect(() => {
    setCurrentIndex(selectedIndex)
  }, [selectedIndex])

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
      {list &&
        React.cloneElement(list, {
          onTabClick: handleTabClick,
          currentIndex,
          variant
        })}
      {panels && React.cloneElement(panels, { currentIndex })}
    </div>
  )
}

Tabs.List = function TabsList({
  children,
  className,
  onTabClick,
  currentIndex,
  variant = 'default'
}: TabsListProps) {
  return (
    <div
      className={clsxTwMerge(variant === 'default' && 'border-b-1 border-primary-60', className)}
    >
      <div
        aria-label="Tabs"
        role="tablist"
        className={clsxTwMerge('flex space-x-2', variant === 'buttons' && 'gap-6')}
      >
        {Children.map(children, (child, index) =>
          isValidElement<TabComponentProps>(child)
            ? React.cloneElement(child, {
                onClick: onTabClick ? () => onTabClick(index) : undefined,
                isSelected: index === currentIndex,
                variant
              })
            : child
        )}
      </div>
    </div>
  )
}

Tabs.Tab = function TabsTab({
  children,
  className,
  isSelected,
  onClick,
  variant = 'default'
}: TabComponentProps) {
  const baseClasses = 'whitespace-nowrap font-space text-sm font-medium transition-all duration-300'

  const defaultVariantClasses = clsxTwMerge(
    'border-b-2 px-16 py-12',
    isSelected
      ? 'border-primary-30 text-primary-30'
      : 'hover:text-primary-600 border-transparent text-gray-500 hover:border-gray-60'
  )

  const buttonsVariantClasses = clsxTwMerge(
    'rounded-md px-12 py-6 text-white',
    isSelected
      ? 'bg-primary-30 text-primary-80'
      : 'bg-primary-60/80 text-gray-100 hover:bg-primary-60/60'
  )

  return (
    <button
      type="button"
      className={clsxTwMerge(
        baseClasses,
        variant === 'default' ? defaultVariantClasses : buttonsVariantClasses,
        className
      )}
      role="tab"
      onClick={onClick}
      aria-selected={isSelected}
    >
      {children}
    </button>
  )
}

Tabs.Panels = function TabsPanels({ children, className, currentIndex }: TabsPanelsProps) {
  return (
    <div className={clsxTwMerge('py-16', className)}>
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

  return (
    <div role="tabpanel" className={className}>
      {children}
    </div>
  )
}
