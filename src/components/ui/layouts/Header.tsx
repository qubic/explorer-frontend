import { QubicExplorerWhiteLogo } from '@app/assets/icons/logo'
import { Routes } from '@app/router'
import { Link } from 'react-router-dom'
import LanguagePicker from '../LanguagePicker'
import SearchBar from '../SearchBar/SearchBar'

function Header() {
  return (
    <header className="relative mx-auto flex items-center justify-center gap-6 border-b border-primary-60 p-20">
      <Link to={Routes.NETWORK.ROOT}>
        <QubicExplorerWhiteLogo />
      </Link>
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
