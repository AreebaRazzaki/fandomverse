import { useEffect, useState } from 'react';
import Anime from './pages/anime';
import Comics from './pages/comics';
import Gaming from './pages/gaming';
import Home from './pages/home';
import Kpop from './pages/kpop';
import Manga from './pages/manga';
import Movies from './pages/movies';
import TvShows from './pages/tvshows';

function App() {
  const getRoute = () => {
    const currentPath = window.location.pathname.toLowerCase();
    const currentHash = window.location.hash.toLowerCase();
    if (currentHash === '#anime' || currentPath.endsWith('/anime')) return 'anime';
    if (currentHash === '#comics' || currentPath.endsWith('/comics')) return 'comics';
    if (currentHash === '#gaming' || currentPath.endsWith('/gaming')) return 'gaming';
    if (currentHash === '#k-pop' || currentPath.endsWith('/k-pop')) return 'kpop';
    if (currentHash === '#manga' || currentPath.endsWith('/manga')) return 'manga';
    if (currentHash === '#movies' || currentPath.endsWith('/movies')) return 'movies';
    if (currentHash === '#tv-shows' || currentHash === '#tvshows' || currentPath.endsWith('/tv-shows')) return 'tvshows';
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
  if (route === 'comics') return <Comics />;
  if (route === 'gaming') return <Gaming />;
  if (route === 'kpop') return <Kpop />;
  if (route === 'manga') return <Manga />;
  if (route === 'movies') return <Movies />;
  if (route === 'tvshows') return <TvShows />;
  return <Home />;
}

export default App;
