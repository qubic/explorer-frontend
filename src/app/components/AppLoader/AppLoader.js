import Lottie from 'lottie-react';
import PropTypes from 'prop-types';
import loaderAnimation from './qubic-loader-animation.json';

const AppLoader = ({ width, height, message }) => {
  return (
    <div id="app-loader" className="w-screen h-screen grid place-content-center bg-[#111827]">
      <Lottie animationData={loaderAnimation} loop autoplay style={{ width, height }} />
      {message && <p className="text-gray-50 text-center text-16 mt-10">{message}</p>}
    </div>
  );
};

AppLoader.defaultProps = {
  width: 200,
  height: 200,
  message: '',
};

AppLoader.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  message: PropTypes.string,
};

export default AppLoader;
