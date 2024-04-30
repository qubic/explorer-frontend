import { Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

function TxStatus(props) {
  const { executed } = props;

  return (
    <div className="flex gap-4 py-2 px-8 bg-gray-70 rounded-full items-center">
      <Typography className=" tex-16 leading-20 text-gray-50 font-space ">TX</Typography>
      <FuseSvgIcon
        className={`text-20 w-20 h-20 ${executed ? 'text-success-40' : 'text-error-40'}`}
      >
        {executed ? 'heroicons-solid:check' : 'heroicons-solid:x'}
      </FuseSvgIcon>
    </div>
  );
}

export default TxStatus;
