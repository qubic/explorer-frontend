import { styled } from '@mui/material/styles';
import FusePageSimple from '@fuse/core/FusePageSimple';
import CurrentTick from './ticks/CurrentTick';
import PastTicks from './past-ticks/PastTicks';

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

function ExplorerPage(props) {

  return (
    <Root
      header={
        <div className="p-20 text-center flex flex-1 mx-4 gap-6 justify-center items-center">
          <img className="logo-icon w-auto h-24" src="assets/images/logo/logo.svg" alt="logo" />
          <h4 className='text-24 font-500'>qubic <span className='text-primary-40'>explorer</span></h4>
        </div>
      }

      content={
        <div className='container px-12 py-52 mx-auto'>
          <div className='max-w-[853px] flex flex-1 flex-col gap-16 mx-auto'>
            <div className='flex flex-auto gap-16'>
              <CurrentTick />
              <CurrentTick />
              <CurrentTick />
            </div>
            <div className='grid xs:grid-cols-2 md:grid-cols-4 gap-16'>
              <CurrentTick />
              <CurrentTick />
              <CurrentTick />
              <CurrentTick />
            </div>
            <PastTicks />
          </div>
        </div>
      }
      scroll="content"
    />
  );
}

export default ExplorerPage;
