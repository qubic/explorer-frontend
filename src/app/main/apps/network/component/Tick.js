import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Typography } from '@mui/material';
import clsx from 'clsx';

function Tick(props) {
    const { icon, title, value, className } = props;
    return (
        <div className='w-full border-gray-70 border-[1px] rounded-8 px-24 py-16'>
            <div className='flex flex-1 gap-10 items-center w-full'>
                <FuseSvgIcon className={clsx("text-24", className)}>{icon}</FuseSvgIcon>
                <div className='flex flex-col gap-5'>
                    <Typography variant='h5' className='text-gray-50 font-space text-sm'>
                        {title}
                    </Typography>
                    <p className='text-22 font-space'>
                        {value}
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Tick;
