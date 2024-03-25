import { useEffect, useState } from 'react';
import { formatString } from 'src/app/utils/functions';
import {
  Typography,
  LinearProgress,
  Input,
  Tooltip,
  Pagination,
  PaginationItem,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { PrevIcon, NextIcon } from 'src/assets/icons/svg';
import { getOverview, selectOverview, selectOverviewLoading } from '../store/overviewSlice';
import TickLink from '../component/TickLink';
import CardItem from '../component/CardItem';

function Overview() {
  const isLoading = useSelector(selectOverviewLoading);
  const dispatch = useDispatch();
  const [searchTick, setSearchTick] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(getOverview());
  }, [dispatch]);

  const network = useSelector(selectOverview);

  const itemsPerPage = 120; // Adjust based on your preference

  const filteredTicks =
    network && network.ticks.length > 0
      ? network.ticks.filter((item) => {
          const itemTickStr = item.tick.toString();
          const sanitizedSearchTick = searchTick.replace(/\D/g, '');
          return itemTickStr.includes(sanitizedSearchTick);
        })
      : [];

  const pageCount = Math.ceil(filteredTicks.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const displayedTicks = filteredTicks.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (event, value) => {
    if (searchTick) {
      setPage(1);
    }
    setPage(value);
  };

  if (isLoading) {
    return (
      <div className="w-full absolute">
        <LinearProgress />
      </div>
    );
  }

  console.log(network);
  return (
    <div className="w-full py-52">
      <div className="max-w-[885px] px-16 flex flex-1 flex-col gap-16 mx-auto">
        <div className="grid md:grid-flow-col gap-16">
          <CardItem className="px-24 py-16">
            <div className="flex items-center gap-24">
              <img className="w-24 h-24" src="assets/icons/dollar-sign.svg" alt="icon" />
              <div className="flex flex-col gap-8">
                <Typography className="text-14 leading-18 text-gray-50 font-space">
                  Price
                </Typography>
                <Typography className="text-18 xs:text-24 leading-20 sm:text-22 sm:leading-28 font-space">
                  ${network?.price}
                </Typography>
              </div>
            </div>
          </CardItem>
          <CardItem className="px-24 py-16">
            <div className="flex items-center gap-24">
              <img className="w-24 h-24" src="assets/icons/globe.svg" alt="icon" />
              <div className="flex flex-col gap-8">
                <Typography className="text-14 leading-18 text-gray-50 font-space">
                  Market Cap
                </Typography>
                <Typography className="text-18 xs:text-24 leading-20 sm:text-22 sm:leading-28 font-space">
                  ${formatString(network?.marketCapitalization)}
                </Typography>
              </div>
            </div>
          </CardItem>
        </div>
        <div className="grid 827px:grid-flow-col gap-16">
          <CardItem className="px-24 py-16">
            <div className="flex items-center gap-24">
              <img className="w-24 h-24" src="assets/icons/hourglass.svg" alt="icon" />
              <div className="flex flex-col gap-8">
                <Typography className="text-14 leading-18 text-gray-50 font-space">
                  Epoch
                </Typography>
                <Typography className="text-18 xs:text-24 leading-20 sm:text-22 sm:leading-28 font-space">
                  ${formatString(network?.marketCapitalization)}
                </Typography>
              </div>
            </div>
          </CardItem>
          <CardItem className="px-24 py-16">
            <div className="flex items-center gap-24">
              <img className="w-24 h-24" src="assets/icons/repeat.svg" alt="icon" />
              <div className="flex flex-col gap-8">
                <Typography className="text-14 leading-18 text-gray-50 font-space">
                  Circulating Supply
                </Typography>
                <Typography className="text-18 xs:text-24 leading-20 sm:text-22 sm:leading-28 font-space">
                  {formatString(network?.supply)}
                </Typography>
              </div>
            </div>
          </CardItem>
          <CardItem className="px-24 py-16">
            <div className="flex items-center gap-24">
              <img className="w-24 h-24" src="assets/icons/wallet.svg" alt="icon" />
              <div className="flex flex-col gap-8">
                <Typography className="text-14 leading-18 text-gray-50 font-space">
                  Active Addresses
                </Typography>
                <Typography className="text-18 xs:text-24 leading-20 sm:text-22 sm:leading-28 font-space">
                  {formatString(network?.numberOfEntities)}
                </Typography>
              </div>
            </div>
          </CardItem>
        </div>
        <div className="grid grid-cols-2 827px:grid-cols-4 gap-16">
          <CardItem className="px-24 py-16">
            <div className="flex flex-col sm:flex-row sm:items-center gap-16 w-full">
              <img className="w-24 h-24" src="assets/icons/grid-add.svg" alt="icon" />
              <div className="flex flex-col gap-8">
                <Typography className="text-14 leading-18 text-gray-50 font-space">
                  Current Tick
                </Typography>
                <Typography className="text-16 leading-20 sm:text-22 sm:leading-28 font-space">
                  {formatString(network?.currentTick)}
                </Typography>
              </div>
            </div>
          </CardItem>
          <CardItem className="px-24 py-16">
            <div className="flex flex-col sm:flex-row sm:items-center gap-16 w-full">
              <img className="w-24 h-24" src="assets/icons/grid-view.svg" alt="icon" />
              <div className="flex flex-col gap-5">
                <Typography className="text-14 leading-18 text-gray-50 font-space">
                  Ticks this epoch
                </Typography>
                <Typography className="text-16 leading-20 sm:text-22 sm:leading-28 font-space">
                  {formatString(network?.numberOfTicks)}
                </Typography>
              </div>
            </div>
          </CardItem>
          <CardItem className="px-24 py-16">
            <div className="flex flex-col sm:flex-row sm:items-center gap-16 w-full">
              <img className="w-24 h-24" src="assets/icons/circle-dashed.svg" alt="icon" />
              <div className="flex flex-col gap-5">
                <Typography className="text-14 leading-18 text-gray-50 font-space flex justify-between items-center">
                  Empty
                  <Tooltip title="Empty is a tick that is empty" arrow placement="bottom-start">
                    <img src="assets/icons/information.svg" alt="icon" />
                  </Tooltip>
                </Typography>
                <Typography className="text-16 leading-20 sm:text-22 sm:leading-28 font-space">
                  {formatString(network?.numberOfEmptyTicks)}
                </Typography>
              </div>
            </div>
          </CardItem>
          <CardItem className="px-24 py-16">
            <div className="flex flex-col sm:flex-row sm:items-center gap-16 w-full">
              <img className="w-24 h-24" src="assets/icons/stars.svg" alt="icon" />
              <div className="flex flex-col gap-5">
                <Typography className="text-14 leading-18 text-gray-50 font-space">
                  Tick Quality
                </Typography>
                <Typography className="text-16 leading-20 sm:text-22 sm:leading-28 font-space">
                  {formatString(
                    ((network?.numberOfTicks - network?.numberOfEmptyTicks) * 100) /
                      network?.numberOfTicks
                  )}
                  %
                </Typography>
              </div>
            </div>
          </CardItem>
        </div>
        <CardItem className="px-24 py-20">
          <div className="flex flex-col gap-20">
            <div className="flex justify-between items-center">
              <Typography variant="h5" className="text-22 font-space font-500">
                Past Ticks
              </Typography>
              <Input
                placeholder="Search"
                className="bg-gray-80 border-gray-70 border-[1px] rounded-8 px-16 py-8"
                value={searchTick}
                disableUnderline
                inputProps={{
                  'aria-label': 'Search',
                }}
                onChange={(e) => {
                  setSearchTick(e.target.value);
                }}
              />
            </div>
            <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-6 md:grid-cols-10 gap-12">
              {displayedTicks.map((item) => (
                <TickLink
                  key={item.tick}
                  value={item.tick}
                  className={`text-12 ${item.arbitrated ? 'text-error-40' : 'text-gray-50'}`}
                />
              ))}
            </div>
            <Pagination
              count={pageCount}
              page={page}
              onChange={handlePageChange}
              variant="outlined"
              shape="rounded"
              sx={{
                mt: 2,
                justifyContent: 'center',
                display: 'flex',
                '& .MuiPaginationItem-root': {
                  color: '#808B9B',
                  border: 'none',
                },
                '& .MuiPaginationItem-root.Mui-selected': {
                  backgroundColor: '#61F0FE',
                  color: '#101820',
                  '&:hover': {
                    backgroundColor: '#03C1DB',
                  },
                },
              }}
              renderItem={(item) => (
                <PaginationItem
                  {...item}
                  components={{
                    previous: PrevIcon,
                    next: NextIcon,
                  }}
                />
              )}
            />
          </div>
        </CardItem>
      </div>
    </div>
  );
}

export default Overview;
