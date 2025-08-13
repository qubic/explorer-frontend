import { HelmetProvider } from 'react-helmet-async'
import { I18nextProvider } from 'react-i18next'
import { Provider as ReduxProvider } from 'react-redux'
import { RouterProvider } from 'react-router-dom'
import { TurnstileProvider } from './components/providers'
import i18n from './configs/i18n'
import { router } from './router'
import { store } from './store'

export default function App() {
  return (
    <HelmetProvider>
      <I18nextProvider i18n={i18n}>
        <ReduxProvider store={store}>
          <TurnstileProvider>
            <RouterProvider router={router} />
          </TurnstileProvider>
        </ReduxProvider>
      </I18nextProvider>
    </HelmetProvider>
  )
}
