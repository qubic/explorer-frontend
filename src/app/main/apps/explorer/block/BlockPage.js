import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Typography } from "@mui/material";
import { useParams } from "react-router-dom"
import { getBlock, selectBlock } from "../store/blockSlice";
import ErrorMessage from "../component/ErrorMessage";

function BlockPage() {

    const dispatch = useDispatch();
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
            <div className="py-36 max-[960px] mx-auto px-8">
                <Typography
                    className="text-16 leading-20">
                    Tick
                </Typography>
            </div>
        </div>
    )
}

export default BlockPage