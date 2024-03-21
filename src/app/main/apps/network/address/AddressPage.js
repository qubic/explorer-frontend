import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { Typography } from "@mui/material";
import AddressLink from "../component/AddressLink";
import TxLink from "../component/TxLink";
import TxStatus from "../component/TxStatus";

import { getAddress, selectAddress } from "../store/addressSlice";

function AddressPage() {

    const routeParams = useParams();
    const { addressId } = routeParams;

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getAddress(addressId))
    }, [routeParams, dispatch])

    const address = useSelector(selectAddress)

    return (
        <div className="w-full">
            <div className="pt-82 pb-40 max-w-[960px] mx-auto px-8">
                <Typography
                    className="font-space text-16 leading-20 mb-12">
                    Tick
                </Typography>
                <Typography
                    className="font-space text-24 leading-30 mb-32">
                    {address?.id}
                </Typography>
                <Typography
                    className="font-space text-14 leading-18 mb-12">
                    Entity Reports from random peers
                </Typography>
                <div className="mb-32">
                    node
                </div>
                <Typography
                    className="text-20 leading-26 font-500 font-space mb-16">
                    Latest transfers
                </Typography>
                <div className="flex flex-col gap-12">
                    {
                        address &&
                        address?.latestTransfers?.map((item) => (

                            <div className="flex flex-col p-12 border-[1px] rounded-8 border-gray-70" key={item.id}>
                                <div className="flex items-center gap-16 mb-14">
                                    <TxStatus
                                        executed={item.executed} />
                                    <TxLink
                                        value={item.id} />
                                </div>
                                <div className="flex flex-col pt-14 border-t-[1px] border-gray-70">
                                    <div className="flex flex-col gap-12 pr-12">
                                        <div className="flex flex-col gap-8">
                                            <div className="flex justify-between items-center">
                                                <Typography
                                                    className="text-14 leading-18 font-space text-gray-50">
                                                    Source
                                                </Typography>
                                                <Typography
                                                    className="text-14 leading-18 font-space text-gray-50">
                                                    Type
                                                </Typography>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <AddressLink
                                                    value={item.sourceId}
                                                />
                                                <Typography
                                                    className="text-14 leading-18 font-space">
                                                    {item.type} Standard
                                                </Typography>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-8">
                                            <div className="flex justify-between items-center">
                                                <Typography
                                                    className="text-14 leading-18 font-space text-gray-50">
                                                    Destination
                                                </Typography>
                                                <Typography
                                                    className="text-14 leading-18 font-space text-gray-50">
                                                    Amount
                                                </Typography>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <AddressLink
                                                    value={item.destId}
                                                />
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

export default AddressPage;