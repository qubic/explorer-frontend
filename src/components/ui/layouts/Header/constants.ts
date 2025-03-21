import { Routes } from '@app/router/routes'
import type { NavigationMenuItem } from './types'

export const NAVIGATION_MENU_ITEMS: NavigationMenuItem[] = [
  {
    i18nKey: 'developers',
    items: [
      {
        i18nKey: 'hackathon',
        href: Routes.NETWORK.DEVELOPERS.HACKATHON
      }
    ]
  },
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
    className:
      'ltr:left-auto ltr:right-0 ltr:lg:right-auto ltr:lg:left-0 rtl:right-auto rtl:left-0 rtl:lg:left-auto rtl:lg:right-0',
    items: [
      {
        i18nKey: 'tokens',
        href: Routes.NETWORK.ASSETS.TOKENS
      },
      {
        i18nKey: 'smartContracts',
        href: Routes.NETWORK.ASSETS.SMART_CONTRACTS
      },
      {
        i18nKey: 'richList',
        href: Routes.NETWORK.ASSETS.RICH_LIST
      }
    ]
  }
]
