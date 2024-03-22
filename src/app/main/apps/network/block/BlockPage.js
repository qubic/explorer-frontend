import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Hidden, IconButton, Typography } from "@mui/material";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { formatDate, formatString } from "src/app/utils/functions";
import { useNavigate, useParams } from "react-router-dom"
import { getBlock, selectBlock } from "../store/blockSlice";
import ErrorMessage from "../component/ErrorMessage";
import AddressLink from "../component/AddressLink";
import TxLink from "../component/TxLink";
import TxStatus from "../component/TxStatus";
import SubCardItem from "../component/SubCardItem";
import TickStatus from "../component/TickStatus";

function BlockPage() {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const routeParams = useParams();

    const { tick } = routeParams;

    useEffect(() => {
        dispatch(getBlock(tick));
    }, [routeParams, dispatch])

    const block = useSelector(selectBlock)
    console.log(block)

    return (
        <div className='w-full '>
            <ErrorMessage />
            <div className="py-36 max-w-[960px] mx-auto px-12">
                <Typography
                    className="text-16 leading-20 mb-8 text-gray-50">
                    Tick
                </Typography>
                <div className="flex justify-between gap-12 items-center mb-36">
                    <div className="flex flex-col gap-8">
                        <div className="flex items-center gap-8">
                            <IconButton
                                onClick={() => navigate(`/network/block/${Number(tick) - 1}`)}>
                                <img className="w-24 h-24" src="assets/icons/arrow-left.svg" alt="icon" />
                            </IconButton>
                            <Typography
                                className="text-32 leading-40 font-500 font-space">
                                {formatString(block?.tick)}
                            </Typography>
                            <IconButton
                                onClick={() => navigate(`/network/block/${Number(tick) + 1}`)}>
                                <img className="w-24 h-24" src="assets/icons/arrow-right.svg" alt="icon" />
                            </IconButton>
                        </div>
                        <Typography
                            className="text-14 leading-20 font-space text-gray-50">
                            {formatDate(block?.timestamp)}
                        </Typography>
                    </div>
                    <div className="hidden md:block">
                        <TickStatus
                            dataStatus={block?.completed}
                            blockStatus={block?.isNonEmpty}
                            numberOfTx={block?.numberOfTx} />
                    </div>
                </div>
                <div className="mb-24">
                    <SubCardItem
                        title="Signature"
                        content={<Typography className="text-14 leading-20 font-space text-gray-50 break-all">{block?.signature}</Typography>} />
                    <SubCardItem
                        title="Block leader"
                        content={<AddressLink value={block?.tickLeaderId} />} />
                </div>
                <div className="mb-24 md:hidden">
                        <TickStatus
                            dataStatus={block?.completed}
                            blockStatus={block?.isNonEmpty}
                            numberOfTx={block?.numberOfTx} />
                    </div>
                <Typography
                    className="text-20 leading-26 font-500 font-space mb-16">
                    Transactions
                </Typography>
                <div className="flex flex-col gap-12">
                    {
                        block &&
                        block?.transactions?.map((item) => (
                            <div className="flex flex-col p-12 border-[1px] rounded-8 border-gray-70" key={item.id}>
                                <div className="flex flex-col md:flex-row md:items-center gap-10 md:gap-16 mb-14">
                                    <div className="">
                                        <TxStatus
                                            executed={item.executed} />
                                    </div>
                                    <TxLink
                                        value={item.id} />
                                </div>
                                <div className="flex flex-col pt-14 border-t-[1px] border-gray-70">
                                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-16">
                                        <div className="flex flex-col gap-16">
                                            <div className="flex flex-col gap-8">
                                                <Typography
                                                    className="text-14 leading-18 font-space text-gray-50">
                                                    Source
                                                </Typography>
                                                <AddressLink
                                                    value={item.sourceId}
                                                />
                                            </div>
                                            <div className="flex flex-col gap-8">
                                                <Typography
                                                    className="text-14 leading-18 font-space text-gray-50">
                                                    Destination
                                                </Typography>
                                                <AddressLink
                                                    value={item.destId}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row md:flex-col gap-24 pr-24">
                                            <div className="flex flex-col gap-5 md:items-end">
                                                <Typography
                                                    className="text-14 leading-18 font-space text-gray-50">
                                                    Type
                                                </Typography>
                                                <Typography
                                                    className="text-14 leading-18 font-space">
                                                    {item.type} Standard
                                                </Typography>
                                            </div>
                                            <div className="flex flex-col gap-5 md:items-end">
                                                <Typography
                                                    className="text-14 leading-18 font-space text-gray-50">
                                                    Amount
                                                </Typography>
                                                <Typography
                                                    className="text-14 leading-18 font-space">
                                                    {item.amount} qus
                                                </Typography>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
    )
}

export default BlockPage