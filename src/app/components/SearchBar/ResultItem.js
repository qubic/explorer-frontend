import { Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function ResultItem(props) {
  const { icon, title, link, items, handleClose } = props;
  const navigate = useNavigate();
  function getItemLink(item) {
    if (item.type === 0) {
      return `${item.id}?tick=${item.tick}`;
    }
    if (item.type === 2) {
      return item.tick;
    }
    return item.id;
  }
  const handleItemClick = (itemLink) => {
    navigate(`${link}${itemLink}`); // Programmatically navigate
    handleClose(); // Close the modal
  };
  return (
    <div className="mt-20 px-12 ">
      <Typography className="text-12 text-gray-50 font-space ">{title}</Typography>
      {items.map((item, key) => (
        <Typography
          className="flex items-center gap-5 py-8 hover:bg-gray-70 break-all"
          component="div"
          role="button"
          key={key}
          onClick={() => handleItemClick(getItemLink(item))}
        >
          {icon}
          {item.id} {item.description}
        </Typography>
      ))}
    </div>
  );
}

export default ResultItem;
