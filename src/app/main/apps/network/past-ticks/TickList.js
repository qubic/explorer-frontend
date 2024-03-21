import { Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { selectNetwork } from '../store/networkSlice';

function TickList() {

    const network = useSelector(selectNetwork)
    console.log(network)
    return (
        <div className='grid grid-cols-10 gap-12'>
            {
                network &&
                (
                    network?.ticks?.map((item, id) => (
                        <Typography
                            component={Link}
                            className={`font-space font-500 ${item.arbitrated ? 'text-error-40' : 'text-gray-50'}`}
                            to={`/network/block/${item.tick}`}
                            key={id}
                            role='button'
                        >
                            {parseInt(item.tick, 10).toLocaleString('en-US')}
                        </Typography>
                    ))
                )
            }
        </div>
    )
}

export default TickList;
