import { useEffect, useState } from 'react';
import { copyText } from 'src/app/utils/functions';

function CopyText(props) {
  const { text } = props;
  const [isCopy, setIsCopy] = useState(false);

  useEffect(() => {
    if (isCopy) {
      setTimeout(() => setIsCopy(false), 1000);
    }
  }, [isCopy]);
  const handleCopy = () => {
    copyText(text);
    setIsCopy(true);
  };

  return (
    <button
      type="button"
      className="w-14 h-14 flex-none" // Adjust the button size for smaller screens
      onClick={handleCopy}
    >
      {isCopy ? (
        <img className="w-full" src="assets/icons/check.svg" alt="" />
      ) : (
        <img className="w-full" src="assets/icons/copy-text.svg" alt="" />
      )}
    </button>
  );
}

export default CopyText;
