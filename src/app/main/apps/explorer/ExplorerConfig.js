import { lazy } from 'react';

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
          path: 'block',
          element: <ExplorerPage />,
          children: [
            {
              path: ':blockId',
              element: <ExplorerPage />
            }
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
