import { useEffect, useState } from 'react';
import Anime from './pages/anime';
import Gaming from './pages/gaming';
import Home from './pages/home';

function App() {
  const getRoute = () => {
    const currentPath = window.location.pathname.toLowerCase();
    const currentHash = window.location.hash.toLowerCase();
    if (currentHash === '#anime' || currentPath.endsWith('/anime')) return 'anime';
    if (currentHash === '#gaming' || currentPath.endsWith('/gaming')) return 'gaming';
    return 'home';
  };
  const [route, setRoute] = useState(getRoute);

  useEffect(() => {
    const handleRouteChange = () => setRoute(getRoute());
    window.addEventListener('hashchange', handleRouteChange);
    window.addEventListener('popstate', handleRouteChange);
    return () => {
      window.removeEventListener('hashchange', handleRouteChange);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  if (route === 'anime') return <Anime />;
  if (route === 'gaming') return <Gaming />;
  return <Home />;
}

export default App;
