import { styled } from '@mui/material/styles';
import FusePageSimple from '@fuse/core/FusePageSimple';
import withReducer from 'app/store/withReducer';
import { Outlet } from 'react-router-dom';

import reducer from './store';

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

function NetworkPage(props) {

  return (
    <Root
      header={
        <div className="p-20 text-center flex flex-1 mx-4 gap-6 justify-center items-center">
          <img className="logo-icon w-auto h-24" src="assets/images/logo/logo.svg" alt="logo" />
          <h4 className='text-24 font-500'>qubic <span className='text-primary-40'>explorer</span></h4>
        </div>
      }

      content={
        <Outlet />
      }
      scroll="content"
    />
  );
}

export default withReducer('network', reducer)(NetworkPage);
