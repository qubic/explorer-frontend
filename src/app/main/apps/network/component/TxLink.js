import { Link } from "react-router-dom";
import { Typography } from "@mui/material";

function TxLink(props) {

    const { value } = props

    return (
        <Typography
            component={Link}
            className="text-16 leading-20 opacity-70 font-space break-all"
            to={`/network/tx/${value}`}
            role='button'
        >
            {value}
        </Typography>
    )

}
export default TxLink