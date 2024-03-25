import { useLayoutEffect, useState } from 'react';
import history from '@history';
import { Router } from 'react-router-dom';

function BrowserRouter({ basename, children, window }) {
  const [state, setState] = useState({
    action: history.action,
    location: history.location,
  });

  // Removed 'history' from the dependency array to address the warning
  useLayoutEffect(() => {
    const unlisten = history.listen(setState);
    return unlisten; // Cleanup listener on component unmount
  }, []); // Empty dependency array indicates this effect runs only once on mount

  return (
    <Router
      basename={basename}
      location={state.location}
      navigationType={state.action}
      navigator={history}
    >
      {children}
    </Router>
  );
}

export default BrowserRouter;
