import i18next from 'i18next';
import AddressPage from './address/AddressPage';
import ar from './i18n/ar';
import de from './i18n/de';
import en from './i18n/en';
import es from './i18n/es';
import fr from './i18n/fr';
import ja from './i18n/ja';
import nl from './i18n/nl';
import pt from './i18n/pt';
import ru from './i18n/ru';
import tr from './i18n/tr';
import zh from './i18n/zh';
import NetworkPage from './NetworkPage';
import Overview from './overview/Overview';
import TickPage from './tick/TickPage';
import TxPage from './tx/TxPage';
import RichListPage from './rich-list/RichListPage';

i18next.addResourceBundle('en', 'networkPage', en);
i18next.addResourceBundle('de', 'networkPage', de);
i18next.addResourceBundle('es', 'networkPage', es);
i18next.addResourceBundle('fr', 'networkPage', fr);
i18next.addResourceBundle('nl', 'networkPage', nl);
i18next.addResourceBundle('ru', 'networkPage', ru);
i18next.addResourceBundle('pt', 'networkPage', pt);
i18next.addResourceBundle('tr', 'networkPage', tr);
i18next.addResourceBundle('zh', 'networkPage', zh);
i18next.addResourceBundle('ja', 'networkPage', ja);
i18next.addResourceBundle('ar', 'networkPage', ar);

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
          display: true,
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
          path: 'tick',
          element: <TickPage />,
          children: [
            {
              path: ':tick',
              element: <TickPage />,
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
        {
          path: 'rich-list',
          element: <RichListPage />,
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
