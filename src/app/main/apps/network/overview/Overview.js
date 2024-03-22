import { useEffect, useState } from 'react';
import { formatString } from 'src/app/utils/functions';
import { Typography, Input } from '@mui/material';

import { useDispatch, useSelector } from 'react-redux';
import { getOverview, selectOverview } from '../store/overviewSlice';

import Tick from '../component/Tick';
import TickLink from '../component/TickLink';

function Overview() {

    const dispatch = useDispatch()
    const [searchTick, setSearchTick] = useState('')

    useEffect(() => {
        dispatch(getOverview())
    }, [dispatch])

    const network = useSelector(selectOverview);


    return (
        <div className='w-full py-52'>
            <div className='max-w-[853px] px-16 flex flex-1 flex-col gap-16 mx-auto'>
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
                <div className='w-full border-gray-70 border-[1px] rounded-8 px-24 py-20'>
                    <div className='flex flex-col gap-20'>
                        <div className='flex justify-between items-center'>
                            <Typography variant='h5' className='text-22 font-space font-500'>
                                Past Ticks
                            </Typography>
                            <Input
                                placeholder='Search'
                                className='bg-gray-80 border-gray-70 border-[1px] rounded-8 px-16 py-8'
                                value={searchTick}
                                disableUnderline
                                inputProps={{
                                    'aria-label': 'Search',
                                }}
                                onChange={(e) => { setSearchTick(e.target.value) }} />
                        </div>
                        <div className='grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-6 md:grid-cols-10 gap-12'>
                            {
                                network?.ticks &&
                                (
                                    network?.ticks?.splice(0, 100).map((item) => (
                                        <TickLink
                                            key={item.tick}
                                            value={item.tick}
                                            className={item.arbitrated ? 'text-error-40' : 'text-gray-50'} />
                                    ))
                                )
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Overview