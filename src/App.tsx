import { HelmetProvider } from 'react-helmet-async'
import { I18nextProvider } from 'react-i18next'
import { Provider as ReduxProvider } from 'react-redux'
import { RouterProvider } from 'react-router-dom'

import i18n from './configs/i18n'
import { ThemeProvider } from './contexts/theme'
import { router } from './router'
import { store } from './store'

export default function App() {
  return (
    <HelmetProvider>
      <I18nextProvider i18n={i18n}>
        <ReduxProvider store={store}>
          <ThemeProvider>
            <RouterProvider router={router} />
          </ThemeProvider>
        </ReduxProvider>
      </I18nextProvider>
    </HelmetProvider>
  )
}
