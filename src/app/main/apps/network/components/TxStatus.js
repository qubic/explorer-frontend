import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Typography } from '@mui/material';

function TxStatus(props) {
  const { executed } = props;
  return (
    <div className="inline-flex gap-4 py-2 px-8 bg-gray-70 rounded-full items-center">
      <Typography className="text-12 leading-20 text-gray-50 font-space ">TX</Typography>
      <FuseSvgIcon
        size="16"
        className={`text-16 w-16 h-16 ${executed ? 'text-success-40' : 'text-error-40'}`}
      >
        {executed ? 'heroicons-solid:check' : 'heroicons-solid:x'}
      </FuseSvgIcon>
    </div>
  );
}

export default TxStatus;
