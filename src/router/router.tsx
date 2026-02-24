import { createBrowserRouter, Navigate } from 'react-router-dom'

import { AppLayout } from '@app/components/ui/layouts'
import { Error404Page } from '@app/pages'
import {
  AddressPageLazy,
  AssetsRichListPageLazy,
  EventsPageLazy,
  ExchangesPageLazy,
  OverviewPage,
  RichListPageLazy,
  SmartContractsPageLazy,
  TickPageLazy,
  TokensPageLazy,
  TxPageLazy
} from '@app/pages/network'
import { Routes } from './routes'

const router: ReturnType<typeof createBrowserRouter> = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <Error404Page />,
    children: [
      {
        index: true,
        element: <Navigate to={Routes.NETWORK.ROOT} />
      },
      {
        path: Routes.NETWORK.ROOT,
        children: [
          {
            index: true,
            element: <OverviewPage />
          },
          {
            path: Routes.NETWORK.TICK(':tick'),
            element: <TickPageLazy />
          },
          {
            path: Routes.NETWORK.TX(':txId'),
            element: <TxPageLazy />
          },
          {
            path: Routes.NETWORK.ADDRESS(':addressId'),
            element: <AddressPageLazy />
          },
          {
            path: Routes.NETWORK.BLOCKCHAIN.EVENTS,
            element: <EventsPageLazy />
          },
          {
            path: Routes.NETWORK.WALLETS.RICH_LIST,
            element: <RichListPageLazy />
          },
          {
            path: Routes.NETWORK.WALLETS.EXCHANGES,
            element: <ExchangesPageLazy />
          },
          {
            path: Routes.NETWORK.ASSETS.TOKENS,
            element: <TokensPageLazy />
          },
          {
            path: Routes.NETWORK.ASSETS.SMART_CONTRACTS,
            element: <SmartContractsPageLazy />
          },
          {
            path: Routes.NETWORK.ASSETS.RICH_LIST(),
            element: <AssetsRichListPageLazy />
          }
        ]
      }
    ]
  },
  {
    path: Routes.NOT_FOUND,
    element: <Error404Page />
  }
])

export default router
