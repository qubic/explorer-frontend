import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { Typography } from "@mui/material";

import { formatEllipsis } from "src/app/utils/functions";
import ErrorMessage from "../component/ErrorMessage";
import TickLink from "../component/TickLink";
import { getTx, selectTx } from "../store/txSlice";

function TxPage() {

    const dispatch = useDispatch();

    const routeParams = useParams();
    const { txId } = routeParams;

    useEffect(() => {
        dispatch(getTx(txId))
    }, [txId, dispatch])

    const tx = useSelector(selectTx);

    console.log(tx)

    return (
        <div className="w-full">
            <ErrorMessage />
            <div className="pt-82 pb-32 max-w-[960px] mx-auto px-8">
                <TickLink
                    value={tx?.tick}
                    className="text-primary-40" />
                <Typography
                    className="text-16 leading-20 font-space text-gray-60 mb-8">
                    {formatEllipsis(tx?.id)}
                </Typography>
            </div>
        </div>
    )
}

export default TxPage;
