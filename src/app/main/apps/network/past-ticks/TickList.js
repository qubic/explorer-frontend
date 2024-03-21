import { useSelector } from 'react-redux';
import {  selectOverview } from '../store/overviewSlice';
import TickLink from '../component/TickLink';

function TickList() {

    const network = useSelector(selectOverview);
    console.log(network)
    return (
        <div className='grid grid-cols-10 gap-12'>
            {
                network &&
                (
                    network?.ticks?.map((item) => (
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
