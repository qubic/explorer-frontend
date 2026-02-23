import { Suspense, useLayoutEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

import { ErrorBoundary } from '@app/components/ui/error-boundaries'
import { AppLoader, LinearProgress } from '@app/components/ui/loaders'
import Footer from './Footer'
import { Header } from './Header'

export default function AppLayout() {
  const location = useLocation()

  useLayoutEffect(() => {
    // Scroll to the top of the page when the route changes
    window.scrollTo({ top: -10, left: 0, behavior: 'instant' })
  }, [location.pathname])

  return (
    <Suspense fallback={<AppLoader />}>
      <Header />
      <main className="min-h-[var(--container-height)] w-full sm:min-h-[var(--desktop-container-height)]">
        <ErrorBoundary key={location.pathname}>
          <Suspense fallback={<LinearProgress />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
    </Suspense>
  )
}
