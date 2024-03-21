import { Typography } from "@mui/material";

function ErrorMessage() {

    return (
        <div className='w-full absolute py-12 bg-warning-90'>
            <Typography
                className="w-full text-15 leading-36 text-warning-40 text-center">
                Beta - Data may not be complete or have errors
            </Typography>
        </div>
    )
}

export default ErrorMessage;