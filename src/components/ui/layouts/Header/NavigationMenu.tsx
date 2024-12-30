import { useCallback, useEffect, useRef, useState } from 'react'

import { ChevronDownIcon } from '@app/assets/icons'
import { DropdownMenu } from '@app/components/ui'
import { clsxTwMerge } from '@app/utils'
import MenuLink from './MenuLink'
import type { MenuItem } from './types'

type Props = Readonly<{
  label: string
  items: MenuItem[]
  activePath: string
  className?: string
}>

export default function NavigationMenu({ label, items, activePath, className }: Props) {
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLUListElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const handleToggleMenu = useCallback(() => {
    setShowMenu((prev) => !prev)
  }, [])

  const handleClickOutside = useCallback((event: MouseEvent) => {
    const target = event.target as Node
    if (!menuRef.current?.contains(target) && !triggerRef.current?.contains(target)) {
      setShowMenu(false)
    }
  }, [])

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [handleClickOutside])

  return (
    <DropdownMenu show={showMenu}>
      <DropdownMenu.Trigger
        onToggle={handleToggleMenu}
        className="flex items-center gap-4 rounded p-8 text-sm text-gray-400 transition-colors duration-500 ease-in-out hover:bg-primary-70"
        ref={triggerRef}
      >
        {label}
        <ChevronDownIcon
          className={clsxTwMerge(
            'size-16 transition-transform duration-500 ease-in-out',
            showMenu ? 'rotate-180' : 'rotate-0'
          )}
        />
      </DropdownMenu.Trigger>
      <DropdownMenu.Content
        className={clsxTwMerge(
          'rounded-t-0 border-t-2 border-primary-60 border-t-primary-30 bg-primary-70',
          className
        )}
      >
        <ul className="grid min-w-120 gap-6 p-10" ref={menuRef}>
          {items.map((menu) => (
            <li key={menu.i18nKey}>
              <MenuLink menu={menu} activePath={activePath} onToggleMenu={handleToggleMenu} />
            </li>
          ))}
        </ul>
      </DropdownMenu.Content>
    </DropdownMenu>
  )
}
