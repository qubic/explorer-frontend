import { Link, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { memo } from 'react';

function Footer() {
  return (
    <footer className="container px-12 py-20 md:py-40 flex flex-col md:flex-row justify-center items-center gap-10 md:gap-32">
      <div className="flex items-center gap-10">
        <img className="h-16" src="assets/images/logo/logo-text-short.svg" alt="logo-short" />
        <Typography className="text-12 font-space text-gray-50">
          {'\u00A9'} {new Date().getFullYear()} Qubic.
        </Typography>
      </div>
      <div className="flex items-center gap-10">
        <Link
          className="text-12 font-space text-white"
          component={RouterLink}
          role="button"
          to="/network/rich-list"
        >
          Rich List
        </Link>
        <span className="text-gray-50">•</span>
        <Link
          href="https://qubic.org/Terms-of-service"
          className="text-12 font-space text-white"
          target="_blank"
          role="button"
        >
          Terms of service
        </Link>
        <span className="text-gray-50">•</span>
        <Link
          href="https://qubic.org/Privacy-policy"
          className="text-12 font-space text-white"
          target="_blank"
          role="button"
        >
          Privacy Policy
        </Link>
        <span className="text-gray-50">•</span>
        <Link
          href="https://status.qubic.li"
          className="text-12 font-space text-white"
          target="_blank"
          role="button"
        >
          Network Status
        </Link>
      </div>
      <Typography className="text-12 font-space text-gray-50">Version 1.4.3</Typography>
    </footer>
  );
}

export default memo(Footer);
