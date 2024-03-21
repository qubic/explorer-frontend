import { Typography } from "@mui/material";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";

function TxStatus(props) {

    const { executed } = props;

    return (
        < Typography
            className="flex gap-4 tex-16 leading-20 text-gray-50 font-space py-2 px-8 bg-gray-70 rounded-full items-center" >
            TX
            < FuseSvgIcon className={`text-20 w-20 h-20 ${executed ? 'text-success-40' : 'text-error-40'}`} >{executed ? 'heroicons-solid:check' : 'heroicons-solid:x'}</FuseSvgIcon >
        </Typography >
    )
}

export default TxStatus;

