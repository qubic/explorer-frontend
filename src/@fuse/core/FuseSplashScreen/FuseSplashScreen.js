import { memo } from 'react';
import AppLoader from 'src/app/components/AppLoader';

function FuseSplashScreen() {
  return <AppLoader />;
}

export default memo(FuseSplashScreen);
