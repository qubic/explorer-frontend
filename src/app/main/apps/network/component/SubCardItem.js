import { Typography } from "@mui/material";

function SubCardItem(props) {

    const { title, content } = props;
    return (
        <div className="flex flex-col md:flex-row gap-12 pt-12 mb-12 border-t-[1px] border-gray-70">
            <Typography
                className="w-120 text-14 leading-20 font-space text-gray-50">
                {title}</Typography>
            {content}
        </div>
    )
}

export default SubCardItem