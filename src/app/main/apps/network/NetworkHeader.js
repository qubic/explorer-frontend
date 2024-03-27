import { Link } from 'react-router-dom';

function NetworkHeader() {
  return (
    <Link
      to="/network"
      className="p-20 text-center flex flex-1 mx-4 gap-6 justify-center items-center"
    >
      <img src="assets/images/logo/logo-text-on-dark.svg" alt="logo" />
    </Link>
  );
}

export default NetworkHeader;
