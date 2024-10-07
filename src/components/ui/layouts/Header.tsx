import { QubicExplorerWhiteLogo } from '@app/assets/icons/logo'
import { Routes } from '@app/router'
import { clsxTwMerge } from '@app/utils'
import { Link } from 'react-router-dom'
import LanguagePicker from '../LanguagePicker'
import SearchBar from '../SearchBar/SearchBar'

function Header() {
  return (
    <header className="relative mx-auto flex items-center justify-between gap-6 border-b border-primary-60 p-20">
      <nav className="flex gap-12">
        <Link to={Routes.NETWORK.ROOT}>
          <QubicExplorerWhiteLogo />
        </Link>
        <div className="flex items-center gap-8">
          <Link
            to={Routes.ANALYTICS}
            className={clsxTwMerge(
              true ? 'bg-primary-60 text-white' : 'text-gray-600 hover:text-gray-800',
              'rounded px-10 py-4 text-sm font-medium'
            )}
          >
            Analytics
          </Link>
        </div>
      </nav>
      <div className="absolute right-12 flex items-center sm:right-24">
        {/* Desktop */}
        <div className="hidden sm:flex">
          <SearchBar />
        </div>
        <LanguagePicker />
      </div>
      {/* Mobile */}
      <div className="absolute left-12 sm:left-24 sm:hidden">
        <SearchBar />
      </div>
    </header>
  )
}

export default Header
