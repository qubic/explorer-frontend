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
import SubCardItem from "../component/SubCardItem";

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
            <div className="py-36 max-w-[960px] mx-auto px-12">
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
                <div className="flex flex-col md:flex-row md:items-center gap-10 md:gap-16 mb-24">
                    <div className="">
                        <TxStatus
                            executed={tx?.executed} />
                    </div>
                    <TxLink
                        value={tx?.id} />
                </div>
                <SubCardItem
                    title="Amount"
                    content={<Typography className="text-14 leading-20 font-space">{tx?.amount} qus</Typography>} />
                <SubCardItem
                    title="Type"
                    content={<Typography className="text-14 leading-20 font-space">{tx?.type} Standard</Typography>} />
                <SubCardItem
                    title="Source"
                    content={<AddressLink
                        value={tx?.sourceId} />} />
                <SubCardItem
                    title="Destination"
                    content={<AddressLink
                        value={tx?.destId} />} />
            </div>
        </div>
    )
}

export default TxPage;
