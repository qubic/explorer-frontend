import { formatString } from 'src/app/utils/functions';

import { useSelector } from 'react-redux';
import { selectNetwork } from '../store/networkSlice';

import Tick from '../component/Tick';
import PastTicks from '../past-ticks/PastTicks';

function Overview() {
    const network = useSelector(selectNetwork)

    return (
        <div className='w-full py-52'>
            <div className='max-w-[853px] px-12 flex flex-1 flex-col gap-16 mx-auto'>
                <div className='flex flex-auto gap-16'>
                    <Tick
                        icon="heroicons-solid:view-grid-add"
                        title="Circulating Supply"
                        className="text-primary-40"
                        value={formatString(network?.supply)}
                    />
                    <Tick
                        icon="heroicons-solid:globe-alt"
                        title="Market Cap"
                        className="text-primary-40"
                        value={formatString(network?.marketCapitalization)}
                    />
                    <Tick
                        icon="heroicons-solid:view-grid-add"
                        title="Circulating Entities"
                        className="text-primary-40"
                        value={formatString(network?.numberOfEntities)}
                    />
                </div>
                <div className='grid xs:grid-cols-2 md:grid-cols-4 gap-16'>
                    <Tick
                        icon="heroicons-solid:view-grid-add"
                        title="Current Tick"
                        className="text-gray-50 "
                        value={formatString(network?.currentTick)}
                    />
                    <Tick
                        icon="heroicons-solid:view-grid"
                        title="Amount of Ticks"
                        className="text-gray-50 "
                        value={formatString(network?.numberOfTicks)}
                    />
                    <Tick
                        icon="heroicons-solid:dots-circle-horizontal"
                        title="Empty"
                        className="text-gray-50 "
                        value={formatString(network?.numberOfEmptyTicks)}
                    />
                    <Tick
                        icon="heroicons-solid:dots-circle-horizontal"
                        title="Tick Quality"
                        className="text-gray-50 "
                        value={formatString(network?.numberOfEmptyTicks)}
                    />
                </div>
                <PastTicks />
            </div>
        </div>
    )
}

export default Overview