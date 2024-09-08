import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'

import { ErrorBoundary } from '@app/components/ui/error-boundaries'
import { AppLoader, LinearProgress } from '@app/components/ui/loaders'
import Footer from './Footer'
import Header from './Header'

export default function AppLayout() {
  return (
    <Suspense fallback={<AppLoader />}>
      <Header />
      <main className="min-h-[var(--container-height)] w-full sm:min-h-[var(--desktop-container-height)]">
        <ErrorBoundary>
          <Suspense fallback={<LinearProgress />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
    </Suspense>
  )
}
