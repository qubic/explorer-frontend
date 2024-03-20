import { styled } from '@mui/material/styles';
import FusePageSimple from '@fuse/core/FusePageSimple';

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

function OverviewPage(props) {

  return (
    <Root
      header={
        <div className="p-24">
          <h4>qubic explorer</h4>
        </div>
      }
      
      content={
        <></>
      }
      scroll="content"
    />
  );
}

export default OverviewPage;
