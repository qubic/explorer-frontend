import { lazy } from 'react'

export { default as AddressPage } from './address/AddressPage'
export { default as OverviewPage } from './OverviewPage'
export { default as TickPage } from './TickPage'
export { default as TxPage } from './TxPage'

export const AddressPageLazy = lazy(() => import('./address/AddressPage'))
export const TickPageLazy = lazy(() => import('./TickPage'))
export const TxPageLazy = lazy(() => import('./TxPage'))
