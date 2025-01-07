import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'

import { QubicExplorerWhiteLogo } from '@app/assets/icons/logo'
import { Routes } from '@app/router/routes'
import BurgerMenu from './BurgerMenu'
import NavigationMenu from './NavigationMenu'
import TopBar from './TopBar'
import { NAVIGATION_MENU_ITEMS } from './constants'

export default function Header() {
  const location = useLocation()
  const { t } = useTranslation('network-page')

  return (
    <>
      <TopBar />
      <header className="border-b border-primary-60">
        <div className="relative mx-auto flex h-[var(--header-height)] max-w-md items-center justify-between gap-6 p-12 sm:h-[var(--desktop-header-height)]">
          <Link to={Routes.NETWORK.ROOT}>
            <QubicExplorerWhiteLogo />
          </Link>

          <nav className="hidden md:block">
            <ul className="flex gap-6">
              {NAVIGATION_MENU_ITEMS.map((menu) => (
                <NavigationMenu
                  key={menu.i18nKey}
                  label={t(menu.i18nKey)}
                  className={menu.className}
                  items={menu.items}
                  activePath={location.pathname}
                />
              ))}
            </ul>
          </nav>
          <div className="absolute flex items-center gap-8 ltr:right-2 ltr:sm:right-24 rtl:left-2 rtl:sm:left-24">
            <div className="md:hidden">
              <BurgerMenu navigationMenus={NAVIGATION_MENU_ITEMS} activePath={location.pathname} />
            </div>
          </div>
        </div>
      </header>
    </>
  )
}
