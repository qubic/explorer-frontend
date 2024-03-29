import i18next from 'i18next';
import en from './i18n/en';
import de from './i18n/de';
import es from './i18n/es';
import fr from './i18n/fr';
import nl from './i18n/nl';
import ru from './i18n/ru';
import pt from './i18n/pt';
import cn from './i18n/cn';
import jp from './i18n/jp';
import NetworkPage from './NetworkPage';
import BlockPage from './block/BlockPage';
import Overview from './overview/Overview';
import TxPage from './tx/TxPage';
import AddressPage from './address/AddressPage';

i18next.addResourceBundle('en', 'networkPage', en);
i18next.addResourceBundle('de', 'networkPage', de);
i18next.addResourceBundle('es', 'networkPage', es);
i18next.addResourceBundle('fr', 'networkPage', fr);
i18next.addResourceBundle('nl', 'networkPage', nl);
i18next.addResourceBundle('ru', 'networkPage', ru);
i18next.addResourceBundle('pt', 'networkPage', pt);
i18next.addResourceBundle('cn', 'networkPage', cn);
i18next.addResourceBundle('jp', 'networkPage', jp);

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
          ],
        },
        {
          path: 'tx',
          element: <TxPage />,
          children: [
            {
              path: ':txId',
              element: <TxPage />,
            },
          ],
        },
        {
          path: 'address',
          element: <AddressPage />,
          children: [
            {
              path: ':addressId',
              element: <AddressPage />,
            },
          ],
        },
      ],
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
