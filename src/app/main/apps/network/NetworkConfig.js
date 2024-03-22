import NetworkPage from './NetworkPage';
import BlockPage from './block/BlockPage';
import Overview from './overview/Overview';
import TxPage from './tx/TxPage';
import AddressPage from './address/AddressPage';

const NetworkConfig = {
  settings: {
    layout: {
      config: {
        navbar: {
          display: false,
        },
        toolbar: {
          display: false,
        },
        footer: {
          display: false,
        },
        leftSidePanel: {
          display: false,
        },
        rightSidePanel: {
          display: false,
        },
      },
    },
  },
  routes: [
    {
      path: 'network',
      element: <NetworkPage />,
      children: [
        {
          path: '',
          element: <Overview />,
        },
        {
          path: 'block',
          element: <BlockPage />,
          children: [
            {
              path: ':tick',
              element: <BlockPage />,
            },
          ]
        },
        {
          path: 'tx',
          element: <TxPage />,
          children: [
            {
              path: ':txId',
              element: <TxPage />,
            }
          ]
        },
        {
          path: 'address',
          element: <AddressPage />,
          children: [
            {
              path: ':addressId',
              element: <AddressPage />,
            },
          ]
        }
      ]
    },
  ],
};

export default NetworkConfig;

/**
 * Lazy load Example
 */
/*
import React from 'react';

const Example = lazy(() => import('./Example'));

const ExampleConfig = {
  settings: {
    layout: {
      config: {},
    },
  },
  routes: [
    {
      path: 'example',
      element: <Example />,
    },
  ],
};

export default ExampleConfig;
*/
