import { lazy } from 'react'

export { default as OverviewPage } from './home/OverviewPage'

export const AddressPageLazy = lazy(() => import('./address/AddressPage'))
export const TickPageLazy = lazy(() => import('./tick/TickPage'))
export const TxPageLazy = lazy(() => import('./TxPage'))
// wallets
export const RichListPageLazy = lazy(() => import('./wallets/rich-list/RichListPage'))
export const ExchangesPageLazy = lazy(() => import('./wallets/exchanges/ExchangesPage'))
