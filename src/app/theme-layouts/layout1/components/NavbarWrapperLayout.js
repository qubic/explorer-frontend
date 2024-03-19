import { ThemeProvider } from '@mui/material/styles';
import { memo } from 'react';
import { useSelector } from 'react-redux';
import { selectFuseCurrentLayoutConfig, selectNavbarTheme } from 'app/store/fuse/settingsSlice';
import { selectFuseNavbar } from 'app/store/fuse/navbarSlice';
import NavbarStyle from './navbar/NavbarStyle';
import NavbarToggleFab from '../../shared-components/NavbarToggleFab';

function NavbarWrapperLayout(props) {
  const config = useSelector(selectFuseCurrentLayoutConfig);
  const navbar = useSelector(selectFuseNavbar);

  const navbarTheme = useSelector(selectNavbarTheme);

  return (
    <>
      <ThemeProvider theme={navbarTheme}>
        <NavbarStyle />
      </ThemeProvider>

      {config.navbar.display && !config.toolbar.display && !navbar.open && <NavbarToggleFab />}
    </>
  );
}

export default memo(NavbarWrapperLayout);
