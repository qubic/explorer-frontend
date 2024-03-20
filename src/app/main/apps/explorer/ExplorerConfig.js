import { lazy } from 'react';
import BlockPage from './block/BlockPage';
import Overview from './overview/Overview';

const ExplorerPage = lazy(() => import('./ExplorerPage'));

const OverviewConfig = {
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
      path: 'explorer',
      element: <ExplorerPage />,
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
        }
      ]
    },
  ],
};

export default OverviewConfig;

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
