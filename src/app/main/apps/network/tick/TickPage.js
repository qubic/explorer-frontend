import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useTheme } from '@mui/material/styles';
import { Breadcrumbs, IconButton, LinearProgress, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatDate, formatString } from 'src/app/utils/functions';
import { getBlock, selectBlock, selectBlockLoading } from '../store/blockSlice';
import AddressLink from '../component/AddressLink';
import TxItem from '../component/TxItem';
import SubCardItem from '../component/SubCardItem';
import TickStatus from '../component/TickStatus';
import HomeLink from '../component/HomeLink';

function TickPage() {
  const theme = useTheme();
  const { t } = useTranslation('networkPage');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { tick } = useParams();
  const block = useSelector(selectBlock);
  const isLoading = useSelector(selectBlockLoading);
  const [displayTransactions, setDisplayTransactions] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const batchSize = 5;
  const scrollRef = useRef(null);

  useEffect(() => {
    dispatch(getBlock(tick));
  }, [tick, dispatch]);

  useEffect(() => {
    if (block && block.transactions) {
      setDisplayTransactions([]);
      setDisplayTransactions(block.transactions.slice(0, batchSize));
      setHasMore(block.transactions.length > batchSize);
    }
  }, [block]);

  const loadMoreTransactions = () => {
    if (displayTransactions.length < block.transactions.length) {
      const nextTransactions = block.transactions.slice(
        displayTransactions.length,
        displayTransactions.length + batchSize
      );
      setDisplayTransactions((prevTransactions) => [...prevTransactions, ...nextTransactions]);
      setHasMore(displayTransactions.length + batchSize < block.transactions.length);
    } else {
      setHasMore(false);
    }
  };

  useEffect(() => {
    const scrollElement = scrollRef.current;
    const handleScroll = () => {
      if (scrollElement.scrollTop + scrollElement.clientHeight >= scrollElement.scrollHeight) {
        console.log('');
      }
    };

    scrollElement.addEventListener('scroll', handleScroll);
    return () => scrollElement.removeEventListener('scroll', handleScroll);
  }, []);

  if (isLoading) {
    return (
      <div className="w-full absolute">
        <LinearProgress />
      </div>
    );
  }

  return (
    <div
      className="w-full max-h-[calc(100vh-76px)] overflow-y-auto"
      id="scrollableDiv"
      ref={scrollRef}
    >
      <div className="py-32 max-w-[960px] mx-auto px-12">
        <Breadcrumbs aria-label="breadcrumb">
          <HomeLink />
          <Typography className="text-12 text-primary-40">
            {t('tick')} {formatString(tick)}
          </Typography>
        </Breadcrumbs>
        <div className="flex justify-between gap-12 items-center mt-24 mb-36">
          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-8">
              <IconButton onClick={() => navigate(`/network/tick/${Number(tick) - 1}`)}>
                <img
                  className="w-24 h-24"
                  src={`assets/icons/arrow-${theme.direction === 'rtl' ? 'right' : 'left'}.svg`}
                  alt="icon"
                />
              </IconButton>
              <Typography className="text-32 leading-40 font-500 font-space">
                {formatString(block?.tick)}
              </Typography>
              <IconButton onClick={() => navigate(`/network/tick/${Number(tick) + 1}`)}>
                <img
                  className="w-24 h-24"
                  src={`assets/icons/arrow-${theme.direction === 'rtl' ? 'left' : 'right'}.svg`}
                  alt="icon"
                />
              </IconButton>
            </div>
            <Typography className="text-14 leading-20 font-space text-gray-50">
              {formatDate(block?.timestamp)}
            </Typography>
          </div>
          <div className="hidden md:block">
            <TickStatus
              dataStatus={block?.completed}
              tickStatus={block?.isNonEmpty}
              numberOfTx={block?.numberOfTx}
            />
          </div>
        </div>
        <div className="mb-24">
          <SubCardItem
            title={t('signature')}
            content={
              <Typography className="text-14 leading-20 font-space text-gray-50 break-all">
                {block?.signature}
              </Typography>
            }
          />
          <SubCardItem
            title={t('tickLeader')}
            content={<AddressLink value={block?.tickLeaderId} tickValue={block?.tick} />}
          />
        </div>
        <div className="mb-24 md:hidden">
          <TickStatus
            dataStatus={block?.completed}
            tickStatus={block?.isNonEmpty}
            numberOfTx={block?.numberOfTx}
          />
        </div>
        <Typography className="text-20 leading-26 font-500 font-space mb-16">
          {t('transactions')}
        </Typography>
        <InfiniteScroll
          dataLength={displayTransactions.length}
          next={loadMoreTransactions}
          hasMore={hasMore}
          scrollableTarget="scrollableDiv"
          loader={
            <Typography className="text-14 text-primary-50 font-bold py-10 text-center">
              Loading...
            </Typography>
          }
          endMessage={
            displayTransactions.length === 0 ? (
              <Typography className="text-14 font-bold py-10 text-center">
                There are no transactions
              </Typography>
            ) : (
              <Typography className="text-14 font-bold py-10 text-center">
                You have seen all transactions
              </Typography>
            )
          }
        >
          <div className="flex flex-col gap-12">
            {displayTransactions.map((item, index) => (
              <TxItem
                key={index}
                executed={item.executed}
                id={item.id}
                sourceId={item.sourceId}
                tick={tick}
                destId={item.destId}
                type={item.type}
                amount={item.amount}
                data={item.data}
              />
            ))}
          </div>
        </InfiniteScroll>
      </div>
    </div>
  );
}

export default TickPage;
