import { lazy } from 'react'

export { default as OverviewPage } from './home/OverviewPage'

export const AddressPageLazy = lazy(() => import('./address/AddressPage'))
export const TickPageLazy = lazy(() => import('./tick/TickPage'))
export const TxPageLazy = lazy(() => import('./TxPage'))
// wallets
export const RichListPageLazy = lazy(() => import('./wallets/rich-list/RichListPage'))
export const ExchangesPageLazy = lazy(() => import('./wallets/exchanges/ExchangesPage'))
// Assets
export const TokensPageLazy = lazy(() => import('./assets/tokens/TokensPage'))
export const SmartContractsPageLazy = lazy(
  () => import('./assets/smart-contracts/SmartContractsPage')
)
export const AssetsRichListPageLazy = lazy(() => import('./assets/rich-list/AssetsRichListPage'))
