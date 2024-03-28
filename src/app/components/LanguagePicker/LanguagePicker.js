import MenuItem from '@mui/material/MenuItem';
import Popover from '@mui/material/Popover';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { changeLanguage, selectCurrentLanguage, selectLanguages } from 'app/store/i18nSlice';
import { IconButton, Typography } from '@mui/material';

function LanguageSwitcher(props) {
  const currentLanguage = useSelector(selectCurrentLanguage);
  const languages = useSelector(selectLanguages);
  const [menu, setMenu] = useState(null);
  const dispatch = useDispatch();

  const langMenuClick = (event) => {
    setMenu(event.currentTarget);
  };

  const langMenuClose = () => {
    setMenu(null);
  };

  function handleLanguageChange(lng) {
    dispatch(changeLanguage(lng.id));

    langMenuClose();
  }

  return (
    <>
      <IconButton className="w-40 h-40" onClick={langMenuClick}>
        <img
          className="w-full h-full"
          src="assets/icons/globe-gray.svg"
          alt={currentLanguage.title}
        />
      </IconButton>
      <Popover
        open={Boolean(menu)}
        anchorEl={menu}
        onClose={langMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        classes={{
          paper: 'py-2 bg-gray-70',
        }}
      >
        {languages.map((lng) => (
          <MenuItem
            className="py-10 min-w-[164px]"
            key={lng.id}
            onClick={() => handleLanguageChange(lng)}
          >
            <Typography className="text-16 leading-20 font-space">{lng.title}</Typography>
          </MenuItem>
        ))}
      </Popover>
    </>
  );
}

export default LanguageSwitcher;
