import { createBrowserRouter, Navigate } from 'react-router-dom'

import { AppLayout } from '@app/components/ui/layouts'
import { Error404Page } from '@app/pages'
import { AddressPageLazy, OverviewPage, TickPageLazy, TxPageLazy } from '@app/pages/network'
import Routes from './routes'

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
            path: Routes.NETWORK.TX(':txId', {}),
            element: <TxPageLazy />
          },
          {
            path: Routes.NETWORK.ADDRESS(':addressId'),
            element: <AddressPageLazy />
          }
        ]
      }
    ]
  }
])

export default router
