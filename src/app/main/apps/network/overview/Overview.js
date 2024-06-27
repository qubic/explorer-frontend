import {
  LinearProgress,
  Link,
  Pagination,
  PaginationItem,
  Tooltip,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { formatString } from 'src/app/utils/functions';
import { NextIcon, PrevIcon } from 'src/assets/icons/svg';
import CardItem from '../components/CardItem';
import TickLink from '../components/TickLink';
import { getOverview, selectOverview, selectOverviewLoading } from '../store/overviewSlice';

function Overview() {
  const isLoading = useSelector(selectOverviewLoading);
  const network = useSelector(selectOverview);
  const { t } = useTranslation('networkPage');
  const theme = useTheme();
  const dispatch = useDispatch();
  const [searchTick, setSearchTick] = useState('');
  const [page, setPage] = useState(1);

  const isSmallScreen = useMediaQuery(theme.breakpoints.down('xs'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const itemsPerPage = 120; // Adjust based on your preference

  useEffect(() => {
    dispatch(getOverview());
  }, [dispatch]);

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
  const siblingCount = isMediumScreen ? 0 : 1;
  const boundaryCount = isSmallScreen ? 0 : 1;

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

  return (
    <div className="w-full pt-32">
      <div className="max-w-[960px] px-16 flex flex-1 flex-col gap-16 mx-auto">
        <div className="grid md:grid-flow-col gap-16">
          <CardItem className="px-24 py-16">
            <div className="flex items-center gap-24">
              <img className="w-24 h-24" src="assets/icons/dollar-coin.svg" alt="icon" />
              <div className="flex flex-col gap-8">
                <Typography className="text-14 leading-18 text-gray-50 font-space">
                  {t('price')}
                </Typography>
                <Typography className="text-18 xs:text-24 leading-20 sm:text-22 sm:leading-28 font-space">
                  ${network?.price}
                </Typography>
              </div>
            </div>
          </CardItem>
          <CardItem className="px-24 py-16">
            <div className="flex items-center gap-24">
              <img className="w-24 h-24" src="assets/icons/coins-stack.svg" alt="icon" />
              <div className="flex flex-col gap-8">
                <Typography className="text-14 leading-18 text-gray-50 font-space">
                  {t('marketCap')}
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
              <img className="w-24 h-24" src="assets/icons/sand-clock.svg" alt="icon" />
              <div className="flex flex-col gap-8">
                <Typography className="text-14 leading-18 text-gray-50 font-space">
                  {t('epoch')}
                </Typography>
                <Typography className="text-18 xs:text-24 leading-20 sm:text-22 sm:leading-28 font-space">
                  {formatString(network?.currentEpoch)}
                </Typography>
              </div>
            </div>
          </CardItem>
          <CardItem className="px-24 py-16">
            <div className="flex items-center gap-24">
              <img className="w-24 h-24" src="assets/icons/circulating-coins.svg" alt="icon" />
              <div className="flex flex-col gap-8">
                <Typography className="text-14 leading-18 text-gray-50 font-space">
                  {t('circulatingSupply')}
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
                  {t('activeAddresses')}
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
              <img className="w-24 h-24" src="assets/icons/current-tick.svg" alt="icon" />
              <div className="flex flex-col gap-8">
                <Typography className="text-14 leading-18 text-gray-50 font-space">
                  {t('currentTick')}
                </Typography>
                <Typography className="text-16 leading-20 sm:text-22 sm:leading-28 font-space">
                  {formatString(network?.currentTick)}
                </Typography>
              </div>
            </div>
          </CardItem>
          <CardItem className="px-24 py-16">
            <div className="flex flex-col sm:flex-row sm:items-center gap-16 w-full">
              <img className="w-24 h-24" src="assets/icons/epoch-ticks.svg" alt="icon" />
              <div className="flex flex-col gap-5">
                <Typography className="text-14 leading-18 text-gray-50 font-space">
                  {t('ticksThisEpoch')}
                </Typography>
                <Typography className="text-16 leading-20 sm:text-22 sm:leading-28 font-space">
                  {formatString(network?.numberOfTicks)}
                </Typography>
              </div>
            </div>
          </CardItem>
          <CardItem className="px-24 py-16">
            <div className="flex flex-col sm:flex-row sm:items-center gap-16 w-full">
              <img className="w-24 h-24" src="assets/icons/empty-ticks.svg" alt="icon" />
              <div className="flex flex-col gap-5">
                <Typography className="text-14 leading-18 text-gray-50 font-space flex items-center gap-10">
                  {t('empty')}
                  <Tooltip title={t('emptyTooltip')} arrow placement="bottom-start">
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
                  {t('tickQuality')}
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
            <div className="flex flex-col sm:flex-row gap-20 sm:gap-8 md:gap-10 lg:gap-20 justify-between">
              <div className="flex justify-between sm:justify-start items-center gap-8">
                <Typography variant="h5" className="text-22 font-space font-500">
                  {t('ticks')}
                </Typography>
                <Typography className=" align-middle text-14 leading-18 font-space text-gray-50">
                  ( {formatString(network && network.ticks[0].tick)} -{' '}
                  {formatString(network && network.ticks[network.ticks.length - 1].tick)} )
                </Typography>
              </div>
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
              siblingCount={siblingCount}
              boundaryCount={boundaryCount}
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
      <div className="container px-12 py-40 flex flex-col sm:flex-row justify-center items-center gap-10 sm:gap-32 ">
        <div className="flex items-center gap-10">
          <img className="h-16" src="assets/images/logo/logo-text-short.svg" alt="logo-short" />
          <Typography className="text-12 font-space text-gray-50">
            {'\u00A9'} {new Date().getFullYear()} Qubic.
          </Typography>
        </div>
        <div className="flex items-center gap-10">
          <Link
            href="https://qubic.org/Terms-of-service"
            className="text-12 font-space text-white"
            target="_blank"
            role="button"
          >
            Terms of service
          </Link>
          <span className="text-gray-50">•</span>
          <Link
            href="https://qubic.org/Privacy-policy"
            className="text-12 font-space text-white"
            target="_blank"
            role="button"
          >
            Privacy Policy
          </Link>
          <span className="text-gray-50">•</span>
          <Link
            href="https://status.qubic.li"
            className="text-12 font-space text-white"
            target="_blank"
            role="button"
          >
            Network Status
          </Link>
        </div>
        <Typography className="text-12 font-space text-gray-50">Version 1.4.1</Typography>
      </div>
    </div>
  );
}

export default Overview;
