import { Outlet, useNavigation } from 'react-router-dom'
import { AppLoader } from '../loaders'
import Footer from './Footer'
import Header from './Header'

export default function AppLayout() {
  const navigation = useNavigation()

  if (navigation.state === 'loading') {
    return <AppLoader />
  }

  return (
    <>
      <Header />
      <main className="w-full min-h-[var(--container-height)] sm:min-h-[var(--desktop-container-height)] px-8 pb-10 pt-20">
        <Outlet />
      </main>
      <Footer />
    </>
  )
}
