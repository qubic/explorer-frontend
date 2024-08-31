import { lazy } from 'react'

export { default as OverviewPage } from './OverviewPage'

export const AddressPageLazy = lazy(() => import('./address/AddressPage'))
export const TickPageLazy = lazy(() => import('./TickPage'))
export const TxPageLazy = lazy(() => import('./TxPage'))
export const RichListPageLazy = lazy(() => import('./rich-list/RichListPage'))
