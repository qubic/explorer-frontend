import { NuqsAdapter } from 'nuqs/adapters/react'
import { HelmetProvider } from 'react-helmet-async'
import { I18nextProvider } from 'react-i18next'
import { Provider as ReduxProvider } from 'react-redux'
import { RouterProvider } from 'react-router-dom'
import i18n from './configs/i18n'
import { AuthProvider } from './contexts'
import { router } from './router'
import { store } from './store'

export default function App() {
  return (
    <HelmetProvider>
      <I18nextProvider i18n={i18n}>
        <ReduxProvider store={store}>
          <AuthProvider>
            <NuqsAdapter>
              <RouterProvider router={router} />
            </NuqsAdapter>
          </AuthProvider>
        </ReduxProvider>
      </I18nextProvider>
    </HelmetProvider>
  )
}
