import clsx from "clsx";

function CardItem(props) {

    const { children, className } = props;

    return (
        <div className={clsx('border-gray-70 border-[1px] rounded-8', className)}>
            {children}
        </div>
    )
}

export default CardItem;