import { Routes } from '@app/router/routes'
import type { NavigationMenuItem } from './types'

// eslint-disable-next-line import/prefer-default-export
export const NAVIGATION_MENU_ITEMS: NavigationMenuItem[] = [
  {
    i18nKey: 'wallets',
    items: [
      {
        i18nKey: 'richList',
        href: Routes.NETWORK.WALLETS.RICH_LIST
      },
      {
        i18nKey: 'exchanges',
        href: Routes.NETWORK.WALLETS.EXCHANGES
      }
    ]
  },
  {
    i18nKey: 'assets',
    items: [
      {
        i18nKey: 'tokens',
        href: Routes.NETWORK.ASSETS.TOKENS
      },
      {
        i18nKey: 'smartContracts',
        href: Routes.NETWORK.ASSETS.SMART_CONTRACTS
      }
    ]
  }
]
