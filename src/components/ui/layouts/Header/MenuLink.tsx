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

  return (
    <Link
      to={menu.href}
      target="_blank"
      rel="noreferrer"
      onClick={onToggleMenu}
      className={clsxTwMerge(
        'flex w-full whitespace-nowrap rounded px-8 py-4 text-sm hover:bg-primary-80',
        activePath === menu.href ? 'text-primary-30' : 'text-gray-50'
      )}
    >
      {t(menu.i18nKey)}
    </Link>
  )
})

export default MenuLink
