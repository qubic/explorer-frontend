import { Link } from 'react-router-dom';
import { Typography } from '@mui/material';
import clsx from 'clsx';
import { formatString } from 'src/app/utils/functions';

function TickLink(props) {
  const { value, className } = props;

  return (
    <Typography
      component={Link}
      className={clsx(`font-space font-500`, className)}
      to={`/network/block/${value}`}
      role="button"
    >
      {formatString(value)}
    </Typography>
  );
}
export default TickLink;
