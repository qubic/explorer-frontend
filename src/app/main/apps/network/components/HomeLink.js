import { Link } from 'react-router-dom';
import { Typography } from '@mui/material';

function HomeLink() {
  return (
    <Typography
      component={Link}
      className="text-16 leading-20 mb-8 text-gray-50"
      to="/network"
      role="button"
    >
      <img src="assets/icons/home.svg" alt="home" />
    </Typography>
  );
}

export default HomeLink;
