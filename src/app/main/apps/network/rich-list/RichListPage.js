import { Breadcrumbs, LinearProgress, Pagination, PaginationItem, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { NextIcon, PrevIcon } from 'src/assets/icons/svg';
import HomeLink from '../components/HomeLink';
import { getRichList, selectRichList } from '../store/richListSlice';

const PAGE_SIZE = 100;

export default function RichListPage() {
  const { t } = useTranslation('networkPage');
  const dispatch = useDispatch();
  const { entities, paginationInfo, isLoading, error } = useSelector(selectRichList);
  const [page, setPage] = useState(1);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('xs'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const siblingCount = isMediumScreen ? 0 : 1;
  const boundaryCount = isSmallScreen ? 0 : 1;

  const handlePageChange = (_event, value) => {
    setPage(value);
  };

  const entitiesWithRank = useMemo(
    () =>
      entities?.map((entity, index) => ({
        ...entity,
        rank: (paginationInfo?.currentPage - 1) * PAGE_SIZE + index + 1,
      })),
    [entities, paginationInfo]
  );

  useEffect(() => {
    dispatch(getRichList({ page }));
  }, [dispatch, page]);

  if (isLoading) {
    return (
      <div className="w-full absolute">
        <LinearProgress />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="py-32 max-w-[960px] mx-auto px-20 space-y-20 md:space-y-40">
        <Breadcrumbs aria-label="breadcrumb">
          <HomeLink />
          <Typography className="text-12 text-primary-40">{t('richList')}</Typography>
        </Breadcrumbs>
        <div className="space-y-14 md:space-y-28">
          <Typography className="text-24 leading-26 font-500 font-space">
            {t('richList')}
          </Typography>
          <div className="w-full bg-gray-80 border-gray-70 border-[1px] rounded-12">
            <table className="w-full ">
              <thead className="border-gray-70 border-b-[1px] text-left text-gray-50 font-space text-sm font-400">
                <tr>
                  <th className="p-16 text-center">
                    <span className="hidden sm:block">{t('rank')}</span>
                  </th>
                  <th className="p-16">
                    <span>{t('addressID')}</span>
                  </th>
                  <th className="p-16">
                    <span>{t('amount')} (QUBIC)</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {entitiesWithRank?.map((entity) => (
                  <tr key={entity.identity} className="border-b">
                    <td className="p-16 text-center">{entity.rank}</td>
                    <td className="p-16 overflow-hidden whitespace-nowrap overflow-ellipsis max-w-[30vw] sm:max-w-[45vw] md:max-w-[50vw]">
                      <Typography
                        role="button"
                        component={Link}
                        to={`/network/address/${entity.identity}`}
                      >
                        {entity.identity}
                      </Typography>
                    </td>
                    <td className="p-16 ">{entity.balance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination
              count={paginationInfo?.totalPages}
              page={paginationInfo?.currentPage}
              onChange={handlePageChange}
              variant="outlined"
              shape="rounded"
              siblingCount={siblingCount}
              boundaryCount={boundaryCount}
              sx={{
                paddingY: 3,
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
        </div>
      </div>
    </div>
  );
}
