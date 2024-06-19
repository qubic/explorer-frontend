import clsx from 'clsx';

function CardItem(props) {
  const { children, className } = props;

  return (
    <div className={clsx('bg-gray-80 border-gray-70 border-[1px] rounded-12', className)}>
      {children}
    </div>
  );
}

export default CardItem;
