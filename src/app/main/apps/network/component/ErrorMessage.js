import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

function ErrorMessage() {
  const { t } = useTranslation('networkPage');

  return (
    <div className="w-full py-12 bg-warning-90">
      <Typography className="w-full text-15 leading-36 text-warning-40 text-center">
        {t('errorMessage')}
      </Typography>
    </div>
  );
}

export default ErrorMessage;
