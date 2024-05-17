import { Link } from 'react-router-dom';
import { Typography } from '@mui/material';
import { formatEllipsis } from 'src/app/utils/functions';
import CopyText from './CopyText';

function AddressLink(props) {
  const { value, copy, ellipsis } = props;

  return (
    <div className="flex gap-10 items-center">
      <Typography
        className="text-14 leading-20 font-space text-primary-40 break-all"
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
