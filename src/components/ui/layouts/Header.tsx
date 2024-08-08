import { QubicExplorerWhiteLogo } from '@app/assets/icons/logo'
import { Routes } from '@app/router'
import { Link } from 'react-router-dom'
import LanguagePicker from '../LanguagePicker'
import SearchBar from '../SearchBar/SearchBar'

function Header() {
  return (
    <header className="p-20 relative flex mx-auto gap-6 justify-center items-center border-b border-gray-70">
      <Link to={Routes.NETWORK.ROOT}>
        <QubicExplorerWhiteLogo />
      </Link>
      <div className="flex items-center absolute right-12 sm:right-24">
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
