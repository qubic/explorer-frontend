import { Link } from 'react-router-dom';
import LanguagePicker from 'src/app/components/LanguagePicker/LanguagePicker';

function NetworkHeader() {
  return (
    <div className="p-20 flex mx-4 gap-6 justify-center items-center">
      <Link to="/network">
        <img src="assets/images/logo/logo-text-on-dark.svg" alt="logo" />
      </Link>
      <div className="absolute right-24">
        <LanguagePicker />
      </div>
    </div>
  );
}

export default NetworkHeader;
