import { Typography } from '@mui/material';
import clsx from 'clsx';
import CardItem from './CardItem';

function OverviewTick(props) {
    const { icon, title, value, className } = props;
    return (
        <CardItem
            className="px-24 py-16">
            <div className={clsx('flex flex-auto items-center', className)}>
                {icon}
                <div className='flex flex-col gap-5'>
                    <Typography variant='h5' className='text-gray-50 font-space text-sm'>
                        {title}
                    </Typography>
                    <p className='text-22 font-space'>
                        {value}
                    </p>
                </div>
            </div>
        </CardItem>
    )
}

export default OverviewTick;
