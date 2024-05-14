import { Link } from 'react-router-dom';
import { Typography } from '@mui/material';
import CopyText from './CopyText';

function AddressLink(props) {
  const { value, tickValue, copy } = props;

  return (
    <div className="flex gap-10 items-center">
      <Typography
        className="text-14 leading-20 font-space text-primary-40 break-all"
        component={Link}
        to={`/network/address/${value}?tick=${tickValue}`}
        role="button"
      >
        {value}
      </Typography>
      {copy && <CopyText text={value} />}
    </div>
  );
}
export default AddressLink;
