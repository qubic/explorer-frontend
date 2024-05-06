import i18next from 'i18next';
import en from './i18n/en';
import de from './i18n/de';
import es from './i18n/es';
import fr from './i18n/fr';
import nl from './i18n/nl';
import ru from './i18n/ru';
import pt from './i18n/pt';
import tr from './i18n/tr';
import zh from './i18n/zh';
import ja from './i18n/ja';
import ar from './i18n/ar';
import Error404Page from './Error404Page';

i18next.addResourceBundle('en', 'error404Page', en);
i18next.addResourceBundle('de', 'error404Page', de);
i18next.addResourceBundle('es', 'error404Page', es);
i18next.addResourceBundle('fr', 'error404Page', fr);
i18next.addResourceBundle('nl', 'error404Page', nl);
i18next.addResourceBundle('ru', 'error404Page', ru);
i18next.addResourceBundle('pt', 'error404Page', pt);
i18next.addResourceBundle('tr', 'error404Page', tr);
i18next.addResourceBundle('zh', 'error404Page', zh);
i18next.addResourceBundle('ja', 'error404Page', ja);
i18next.addResourceBundle('ar', 'error404Page', ar);

const Error404Config = {
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
      path: '404',
      element: <Error404Page />,
    },
  ],
};

export default Error404Config;
