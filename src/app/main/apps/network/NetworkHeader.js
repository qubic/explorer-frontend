import { Link } from 'react-router-dom';
import LanguagePicker from 'src/app/components/LanguagePicker/LanguagePicker';
import SearchBar from 'src/app/components/SearchBar/SearchBar';

function NetworkHeader() {
  return (
    <div className="p-20 flex mx-4 gap-6 justify-center items-center">
      <Link to="/network">
        <img src="assets/images/logo/logo-text-on-dark.svg" alt="logo" />
      </Link>
      <div className="absolute right-24">
        <div className="hidden sm:inline">
          <SearchBar />
        </div>
        <LanguagePicker />
      </div>
      <div className="absolute left-24 sm:hidden">
        <SearchBar />
      </div>
    </div>
  );
}

export default NetworkHeader;
