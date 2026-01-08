import { useCallback, useState } from 'react'
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

  const handleToggleMenu = useCallback(() => {
    setShowMenu((prev) => !prev)
  }, [])

  return (
    <DropdownMenu show={showMenu} onToggle={handleToggleMenu}>
      <DropdownMenu.Trigger className="rounded-full p-8 transition-colors duration-500 ease-in-out hover:bg-primary-60/80">
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
      <DropdownMenu.Content className="min-w-256 ltr:left-auto ltr:right-0">
        <ul className="grid gap-8 p-16">
          {navigationMenus.map(
            (menu) =>
              menu.items && (
                <Accordion key={menu.i18nKey} as="li" label={t(menu.i18nKey)}>
                  <ul className="mt-4">
                    {menu.items.map((item) => (
                      <li key={item.i18nKey}>
                        <MenuLink
                          menu={item}
                          activePath={activePath}
                          onToggleMenu={handleToggleMenu}
                        />
                      </li>
                    ))}
                  </ul>
                </Accordion>
              )
          )}
        </ul>
      </DropdownMenu.Content>
    </DropdownMenu>
  )
}
