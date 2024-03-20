import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Input, Typography } from '@mui/material';
import { useState } from 'react';
import TickList from './TickList';

function PastTicks() {

    const [searchTick, setSearchTick] = useState('');
    return (
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
                <TickList />
            </div>
        </div>
    )
}

export default PastTicks;
