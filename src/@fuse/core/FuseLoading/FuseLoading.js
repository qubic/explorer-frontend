import { useTimeout } from '@fuse/hooks';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

function FuseLoading({ delay, className }) {
  const { t } = useTranslation('networkPage');

  const [showLoading, setShowLoading] = useState(!delay);

  useTimeout(() => {
    setShowLoading(true);
  }, delay);

  return (
    <div
      className={clsx(
        'flex flex-1 flex-col items-center justify-center p-24',
        !showLoading && 'hidden'
      )}
    >
      <Typography
        className={clsx('text-13 sm:text-20 font-medium -mb-16', className)}
        color="text.secondary"
      >
        {t('loading')}
      </Typography>
      <Box
        id="spinner"
        sx={{
          '& > div': {
            backgroundColor: 'palette.secondary.main',
          },
        }}
      >
        <div className="bounce1" />
        <div className="bounce2" />
        <div className="bounce3" />
      </Box>
    </div>
  );
}

FuseLoading.propTypes = {
  delay: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]),
  className: PropTypes.string,
};

FuseLoading.defaultProps = {
  delay: false,
  className: '',
};

export default FuseLoading;
