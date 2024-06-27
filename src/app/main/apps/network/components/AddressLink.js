import { Typography } from '@mui/material';
import clsx from 'clsx';
import { Link } from 'react-router-dom';
import { formatEllipsis } from 'src/app/utils/functions';
import CopyText from './CopyText';

function AddressLink({ value, copy, ellipsis, className }) {
  return (
    <div className="flex gap-10 items-center">
      <Typography
        className={clsx('text-14 leading-20 font-space text-primary-40 break-all', className)}
        component={Link}
        to={`/network/address/${value}`}
        role="button"
      >
        {ellipsis ? formatEllipsis(value) : value}
      </Typography>
      {copy && <CopyText text={value} />}
    </div>
  );
}
export default AddressLink;
