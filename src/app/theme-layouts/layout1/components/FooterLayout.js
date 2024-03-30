import AppBar from '@mui/material/AppBar';
import { ThemeProvider } from '@mui/material/styles';
import { memo } from 'react';
import { useSelector } from 'react-redux';
import { selectFooterTheme } from 'app/store/fuse/settingsSlice';
import clsx from 'clsx';
import { Typography } from '@mui/material';

function FooterLayout(props) {
  const footerTheme = useSelector(selectFooterTheme);

  return (
    <ThemeProvider theme={footerTheme}>
      <AppBar
        id="fuse-footer"
        className={clsx('relative z-20 shadow-md bg-gray-70', props.className)}
        color="default"
      >
        <div className="container px-12 py-16 flex flex-col sm:flex-row items-center sm:justify-between sm:items-end gap-10">
          <div className="flex flex-col items-center sm:items-start gap-10">
            <img className="h-24" src="assets/images/logo/logo-text-short.svg" alt="logo-short" />
            <Typography className="text-14 leading-18 font-space">
              {'\u00A9'} {new Date().getFullYear()} Qubic. All Rights Reserved.
            </Typography>
          </div>
          <div className="flex gap-10">
            <a
              style={{ textDecoration: 'none', color: 'white' }}
              className="text-14 leading-18 font-space"
              href="https://qubic.org/Terms-of-service"
            >
              Terms of service
            </a>
            <a
              style={{ textDecoration: 'none', color: 'white' }}
              className="text-14 leading-18 font-space"
              href="https://qubic.org/Privacy-policy"
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </AppBar>
    </ThemeProvider>
  );
}

export default memo(FooterLayout);
