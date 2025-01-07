import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { clsxTwMerge } from '@app/utils'
import type { MenuItem } from './types'

type Props = {
  menu: MenuItem
  activePath: string
  onToggleMenu: () => void
}

const MenuLink = memo(({ menu, activePath, onToggleMenu }: Props) => {
  const { t } = useTranslation()

  const classNames = clsxTwMerge(
    'flex w-full whitespace-nowrap rounded px-8 py-4 text-sm hover:bg-primary-80',
    activePath === menu.href ? 'text-primary-30' : 'text-gray-50'
  )

  return menu.isExternal ? (
    <a
      href={menu.href}
      target="_blank"
      rel="noreferrer"
      onClick={onToggleMenu}
      className={classNames}
    >
      {t(menu.i18nKey)}
    </a>
  ) : (
    <Link to={menu.href} onClick={onToggleMenu} className={classNames}>
      {t(menu.i18nKey)}
    </Link>
  )
})

export default MenuLink
