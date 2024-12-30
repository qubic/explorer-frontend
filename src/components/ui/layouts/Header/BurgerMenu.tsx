import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Bars3Icon, XmarkIcon } from '@app/assets/icons'
import { DropdownMenu } from '@app/components/ui'
import { clsxTwMerge } from '@app/utils'
import Accordion from '../../Accordion'
import MenuLink from './MenuLink'
import type { NavigationMenuItem } from './types'

type Props = Readonly<{
  navigationMenus: NavigationMenuItem[]
  activePath: string
}>

export default function BurgerMenu({ navigationMenus, activePath }: Props) {
  const [showMenu, setShowMenu] = useState(false)
  const { t } = useTranslation()
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
        className="rounded-full p-8 transition-colors duration-500 ease-in-out hover:bg-primary-60/80"
        ref={triggerRef}
      >
        <div className="relative size-24">
          <XmarkIcon
            className={clsxTwMerge(
              'absolute inset-0 size-24 transition-all duration-1000 ease-in-out',
              showMenu ? 'rotate-0 opacity-100' : 'rotate-180 opacity-0'
            )}
          />
          <Bars3Icon
            className={clsxTwMerge(
              'absolute inset-0 size-24 transition-all duration-1000 ease-in-out',
              showMenu ? 'rotate-180 opacity-0' : 'rotate-0 opacity-100'
            )}
          />
        </div>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content className="left-auto right-0 min-w-256">
        <ul className="grid gap-8 p-16" ref={menuRef}>
          {navigationMenus.map(({ i18nKey, items }) => (
            <Accordion key={i18nKey} as="li" label={t(i18nKey)}>
              <ul className="mt-4">
                {items.map((menu) => (
                  <li key={menu.i18nKey}>
                    <MenuLink menu={menu} activePath={activePath} onToggleMenu={handleToggleMenu} />
                  </li>
                ))}
              </ul>
            </Accordion>
          ))}
        </ul>
      </DropdownMenu.Content>
    </DropdownMenu>
  )
}
