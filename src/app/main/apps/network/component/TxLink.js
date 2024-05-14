import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { Link } from 'react-router-dom';
import { Typography } from '@mui/material';
import { copyText } from 'src/app/utils/functions';

function TxLink(props) {
  const { value, className, copy } = props;
  const [isCopy, setIsCopy] = useState(false);

  useEffect(() => {
    if (isCopy) {
      setTimeout(() => setIsCopy(false), 1000);
    }
  }, [isCopy]);
  const handleCopy = () => {
    copyText(value);
    setIsCopy(true);
  };
  return (
    <div className="flex gap-10 items-center">
      <Typography
        component={Link}
        className={clsx('text-16 leading-20 font-space break-all', className)}
        to={`/network/tx/${value}`}
        role="button"
      >
        {value}
      </Typography>
      {copy && (
        <button
          type="button"
          className="w-14 h-14 " // Adjust the button size for smaller screens
          onClick={handleCopy}
        >
          {isCopy ? (
            <img className="w-full" src="assets/icons/check.svg" alt="" />
          ) : (
            <img className="w-full" src="assets/icons/copy-text.svg" alt="" />
          )}
        </button>
      )}
    </div>
  );
}
export default TxLink;
