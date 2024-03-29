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
import Error404Page from './Error404Page';

i18next.addResourceBundle('en', 'error404Page', en);
i18next.addResourceBundle('de', 'error404Page', de);
i18next.addResourceBundle('es', 'error404Page', es);
i18next.addResourceBundle('fr', 'error404Page', fr);
i18next.addResourceBundle('nl', 'error404Page', nl);
i18next.addResourceBundle('ru', 'error404Page', ru);
i18next.addResourceBundle('pt', 'error404Page', pt);
i18next.addResourceBundle('cn', 'error404Page', cn);
i18next.addResourceBundle('jp', 'error404Page', jp);

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
