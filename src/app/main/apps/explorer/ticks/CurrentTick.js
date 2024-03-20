import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Typography } from '@mui/material';

function CurrentTick() {
    return (
        <div className='w-full border-gray-70 border-[1px] rounded-8 px-24 py-16'>
            <div className='flex flex-1 gap-10 items-center w-full'>
                <FuseSvgIcon className="text-gray-50 text-24">heroicons-solid:view-grid-add</FuseSvgIcon>
                <div className='flex flex-col gap-5'>
                    <Typography variant='h5' className='text-gray-50 font-space text-sm'>
                        Current Tick
                    </Typography>
                    <p className='text-22 font-space'>
                        13,033,584
                    </p>
                </div>
            </div>
        </div>
    )
}

export default CurrentTick;
