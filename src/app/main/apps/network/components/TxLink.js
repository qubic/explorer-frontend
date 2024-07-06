import { Typography } from '@mui/material';
import clsx from 'clsx';
import { Link } from 'react-router-dom';
import { formatEllipsis } from 'src/app/utils/functions';
import CopyText from './CopyText';

export default function TxLink({ value, className, copy, ellipsis, isHistoricalTx }) {
  return (
    <div className="flex gap-10 items-center">
      <Typography
        component={Link}
        className={clsx('font-space break-all', className)}
        to={`/network/tx/${value}?type=${isHistoricalTx ? 'historical' : 'latest'}`}
        role="button"
      >
        {ellipsis ? formatEllipsis(value) : value}
      </Typography>
      {copy && <CopyText text={value} />}
    </div>
  );
}

TxLink.defaultProps = {
  isHistoricalTx: false,
};
