import { useSelector } from 'react-redux';
import { formatString } from 'src/app/utils/functions';
import { selectNetwork } from '../store/networkSlice';
import TickLink from '../component/TickLink';

function TickList() {

    const network = useSelector(selectNetwork)
    console.log(network)
    return (
        <div className='grid grid-cols-10 gap-12'>
            {
                network &&
                (
                    network?.ticks?.map((item, id) => (
                        <TickLink
                            key={item.tick}
                            value={item.tick}
                            className={item.arbitrated ? 'text-error-40' : 'text-gray-50'} />
                    ))
                )
            }
        </div>
    )
}

export default TickList;
