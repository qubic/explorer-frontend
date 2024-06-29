import FusePageSimple from '@fuse/core/FusePageSimple';
import { styled } from '@mui/material/styles';
import withReducer from 'app/store/withReducer';
import { Outlet } from 'react-router-dom';

import NetworkHeader from './NetworkHeader';
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
  return <Root header={<NetworkHeader />} content={<Outlet />} scroll="normal" />;
}

export default withReducer('network', reducer)(NetworkPage);
