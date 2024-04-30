import clsx from 'clsx';
import { Link } from 'react-router-dom';
import { Typography } from '@mui/material';

function TxLink(props) {
  const { value, className } = props;

  return (
    <Typography
      component={Link}
      className={clsx('text-16 leading-20 font-space break-all', className)}
      to={`/network/tx/${value}`}
      role="button"
    >
      {value}
    </Typography>
  );
}
export default TxLink;
