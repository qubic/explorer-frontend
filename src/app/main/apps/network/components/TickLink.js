import { Typography } from '@mui/material';
import clsx from 'clsx';
import { Link } from 'react-router-dom';
import { formatString } from 'src/app/utils/functions';

export default function TickLink({ value, className }) {
  return (
    <Typography
      component={Link}
      className={clsx(`font-space font-500`, className)}
      to={`/network/tick/${value}`}
      role="button"
    >
      {formatString(value)}
    </Typography>
  );
}
