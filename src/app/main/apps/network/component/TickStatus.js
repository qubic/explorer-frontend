import { Typography } from "@mui/material";

import { formatString } from "src/app/utils/functions";
import CardItem from "./CardItem";

function TickStatus(props) {

    const { dataStatus, blockStatus, numberOfTx } = props;

    return (
        <CardItem
            className="px-24 py-16">
            <div className="flex flex-col md:flex-row justify-between gap-24 md:gap-52">
                <div className="flex gap-52">
                    <div className="flex flex-col gap-8">
                        <Typography
                            className="text-14 leading-20 font-space text-gray-50"
                        >
                            Data Status
                        </Typography>
                        {
                            dataStatus ?

                                <Typography
                                    className="text-16 leading-20 font-space text-success-40"
                                >
                                    Complete
                                </Typography>
                                :
                                <Typography
                                    className="text-16 leading-20 font-space text-error-40"
                                >
                                    Incomplete
                                </Typography>
                        }
                    </div>
                    <div className="flex flex-col gap-8">
                        <Typography
                            className="text-14 leading-20 font-space text-gray-50"
                        >
                            Block Status
                        </Typography>
                        {
                            blockStatus ?
                                <Typography
                                    className="text-16 leading-20 font-space text-success-40"
                                >
                                    Non empty / executed
                                </Typography>
                                :
                                <Typography
                                    className="text-16 leading-20 font-space text-error-40"
                                >
                                    Empty / unexecuted
                                </Typography>
                        }
                    </div>
                </div>
                <div className="flex flex-col gap-8">
                    <Typography
                        className="text-14 leading-20 font-space text-gray-50"
                    >
                        Number of transactions
                    </Typography>
                    <Typography
                        className="text-16 leading-20 font-space text-primary-20"
                    >
                        {formatString(numberOfTx)}
                    </Typography>
                </div>
            </div>
        </CardItem>
    )
}

export default TickStatus;

