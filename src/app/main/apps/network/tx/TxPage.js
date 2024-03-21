import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { Typography } from "@mui/material";

import { formatEllipsis } from "src/app/utils/functions";
import ErrorMessage from "../component/ErrorMessage";
import TxStatus from "../component/TxStatus";
import TxLink from "../component/TxLink";
import TickLink from "../component/TickLink";
import { getTx, selectTx } from "../store/txSlice";
import AddressLink from "../component/AddressLink";

function TxPage() {

    const dispatch = useDispatch();

    const routeParams = useParams();
    const { txId } = routeParams;

    useEffect(() => {
        dispatch(getTx(txId))
    }, [routeParams, dispatch])

    const tx = useSelector(selectTx);

    console.log(tx)

    return (
        <div className="w-full">
            <ErrorMessage />
            <div className="pt-82 pb-32 max-w-[960px] mx-auto px-8">
                <div className="flex mb-16">
                    <TickLink
                        value={tx?.tick}
                        className="text-primary-40" />
                    <Typography
                        className="text-16 leading-20 font-space text-gray-60 mx-8">
                        /
                    </Typography>
                    <Typography
                        className="text-16 leading-20 font-space text-[#9E9E9E] ">
                        {formatEllipsis(tx?.id)}
                    </Typography>
                </div>
                <Typography
                    className="text-24 leading-28 font-space mb-16">
                    Transaction preview
                </Typography>
                <div className="flex items-center gap-16 mb-32">
                    <TxStatus
                        executed={tx?.executed} />
                    <TxLink
                        value={tx?.id} />
                </div>
                <div className="flex pt-12 mb-12 border-t-[1px] border-gray-70">
                    <Typography
                        className="w-120 text-14 leading-20 font-space text-gray-50">
                        Amount</Typography>
                    <Typography
                        className="text-14 leading-20 font-space ">
                        {tx?.amount} qus</Typography>
                </div>
                <div className="flex pt-12 mb-12 border-t-[1px] border-gray-70">
                    <Typography
                        className="w-120 text-14 leading-20 font-space text-gray-50">
                        Type</Typography>
                    <Typography
                        className="text-14 leading-20 font-space ">
                        {tx?.type} Standard</Typography>
                </div>
                <div className="flex pt-12 mb-12 border-t-[1px] border-gray-70">
                    <Typography
                        className="w-120 text-14 leading-20 font-space text-gray-50">
                        Source</Typography>
                    <AddressLink
                        value={tx?.sourceId} />
                </div>
                <div className="flex pt-12 mb-12 border-t-[1px] border-gray-70">
                    <Typography
                        className="w-120 text-14 leading-20 font-space text-gray-50">
                        Destination</Typography>
                    <AddressLink
                        value={tx?.destId} />
                </div>
            </div>
        </div>
    )
}

export default TxPage;
