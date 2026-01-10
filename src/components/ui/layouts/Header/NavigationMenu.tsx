import { useCallback, useState } from 'react'

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

  const handleToggleMenu = useCallback(() => {
    setShowMenu((prev) => !prev)
  }, [])

  return (
    <DropdownMenu show={showMenu} onToggle={handleToggleMenu}>
      <DropdownMenu.Trigger className="flex items-center gap-4 rounded p-8 text-sm text-muted-foreground transition-colors duration-500 ease-in-out hover:bg-muted">
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
          'rounded-t-0 border-t-2 border-border border-t-primary-30 bg-popover',
          className
        )}
      >
        <ul className="grid min-w-120 gap-6 p-10">
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
