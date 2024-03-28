import { styled } from '@mui/material/styles';
import FusePageSimple from '@fuse/core/FusePageSimple';
import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Root = styled(FusePageSimple)(({ theme }) => ({
  '& .FusePageSimple-header': {
    backgroundColor: theme.palette.background.paper,
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderColor: theme.palette.divider,
  },
  '& .FusePageSimple-toolbar': {},
  '& .FusePageSimple-content': {},
  '& .FusePageSimple-sidebarHeader': {},
  '& .FusePageSimple-sidebarContent': {},
}));

function Error404Page() {
  const { t } = useTranslation('error404Page');

  return (
    <Root
      header={
        <Link
          to="/network"
          className="p-20 text-center flex flex-1 mx-4 gap-6 justify-center items-center"
        >
          <img src="assets/images/logo/logo-text-on-dark.svg" alt="logo" />
        </Link>
      }
      content={
        <div className="w-full">
          <div className="relative h-[315px] md:h-[496px] overflow-hidden flex justify-center items-end">
            <img
              className="h-[267px] md:h-[460px] max-w-[742px] md:max-w-[1279px]"
              src="assets/images/errors/error404.svg"
              alt="error404"
            />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
          >
            <Typography
              variant="h1"
              className="text-32 leading-40 md:text-4xl md:leading-tight font-700 font-space text-center"
            >
              {t('pageNotFound')}
            </Typography>
          </motion.div>

          <motion.div
            className="max-w-[400px] mx-auto"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
          >
            <Typography className="mt-16 text-16 md:text-18 leading-20 font-space text-gray-50 text-center">
              {t('error404Message')}
            </Typography>
          </motion.div>
          <div className="mt-32 md:mt-40 text-center">
            <Typography
              component={Link}
              className=" py-10 px-28 bg-primary-50 rounded-8 font-500 font-space text-16 leading-28 text-gray-90 "
              to="/"
              role="button"
            >
              {t('backToHomePage')}
            </Typography>
          </div>
        </div>
      }
    />
  );
}

export default Error404Page;
