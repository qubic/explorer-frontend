import { Typography } from '@mui/material';
import { Link } from 'react-router-dom';

function ResultItem({ icon, title, content, link, items, onClick }) {
  return (
    <>
      <div className="mt-20 px-12 ">
        <Typography className="text-12 text-gray-50 font-space">{title}</Typography>
        <Typography
          className="flex items-center gap-5 py-8 hover:bg-gray-70 break-all"
          component={Link}
          to={link}
          role="button"
          onClick={onClick}
        >
          {icon}
          {content}
        </Typography>
      </div>
      {items && (
        <div className="mt-20 px-12 ">
          <Typography className="text-12 text-gray-50 font-space ">Transactions</Typography>
          {(items || []).map((item, key) => (
            <Typography
              className="flex items-center gap-5 py-8 hover:bg-gray-70 break-all"
              component={Link}
              to={`/network/tx/${item}`}
              role="button"
              key={key}
              onClick={onClick}
            >
              <img className="w-16 h-16 mr-6" src="assets/icons/camera.svg" alt="transaction" />
              {item}
            </Typography>
          ))}
        </div>
      )}
    </>
  );
}

export default ResultItem;
