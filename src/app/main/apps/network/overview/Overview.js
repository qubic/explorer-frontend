import { useEffect, useState } from 'react';
import { formatString } from 'src/app/utils/functions';
import { Typography, LinearProgress, Input } from '@mui/material';

import { useDispatch, useSelector } from 'react-redux';
import { getOverview, selectOverview, selectOverviewLoading } from '../store/overviewSlice';

import TickLink from '../component/TickLink';
import CardItem from '../component/CardItem';

function Overview() {
  const isLoading = useSelector(selectOverviewLoading);
  const dispatch = useDispatch();
  const [searchTick, setSearchTick] = useState('');

  useEffect(() => {
    dispatch(getOverview());
  }, [dispatch]);

  const network = useSelector(selectOverview);

  if (isLoading) {
    return (
      <div className="w-full absolute">
        <LinearProgress />
      </div>
    );
  }

  return (
    <div className="w-full py-52">
      <div className="max-w-[853px] px-16 flex flex-1 flex-col gap-16 mx-auto">
        <div className="grid 827px:grid-flow-col gap-16">
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
                  Circulating Entities
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
                  Amount of Tick
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
                <Typography className="text-14 leading-18 text-gray-50 font-space">
                  Empty
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
              {network &&
                network.ticks.length > 0 &&
                network.ticks
                  .filter((item) => item.tick.toString().includes(searchTick))
                  .map((item) => (
                    <TickLink
                      key={item.tick}
                      value={item.tick}
                      className={`text-12 ${item.arbitrated ? 'text-error-40' : 'text-gray-50'}`}
                    />
                  ))}
            </div>
          </div>
        </CardItem>
      </div>
    </div>
  );
}

export default Overview;
