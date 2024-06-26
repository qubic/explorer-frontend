import PropTypes from 'prop-types';
import { Suspense } from 'react';
import AppLoader from 'src/app/components/AppLoader';

/**
 * React Suspense defaults
 * For to Avoid Repetition
 */ function FuseSuspense(props) {
  return <Suspense fallback={<AppLoader {...props.loadingProps} />}>{props.children}</Suspense>;
}

FuseSuspense.propTypes = {
  loadingProps: PropTypes.object,
};

FuseSuspense.defaultProps = {
  loadingProps: {
    delay: 0,
  },
};

export default FuseSuspense;
