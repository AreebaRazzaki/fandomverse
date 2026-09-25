import { useEffect, useState } from 'react';
import SiteNav from '../components/SiteNav';
import './gaming.css';

const gameSlides = ['/assets/images/game1.png', '/assets/images/game2.png'];
const particleKinds = ['cube', 'cross', 'diamond', 'controller', 'cube', 'cross', 'diamond', 'controller', 'cube', 'cross', 'diamond', 'controller', 'cube', 'cross', 'diamond', 'controller', 'cube', 'cross', 'diamond', 'controller', 'cube', 'cross', 'diamond', 'controller'];

function Gaming() {
  const [theme, setTheme] = useState(() => window.localStorage.getItem('fandomverse-theme') || 'dark');
  const [loadProgress, setLoadProgress] = useState(23);
  const [isBooted, setIsBooted] = useState(false);
  const [activeGame, setActiveGame] = useState(0);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setLoadProgress(67), 760),
      window.setTimeout(() => setLoadProgress(100), 1520),
      window.setTimeout(() => setIsBooted(true), 2220),
    ];

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, []);

  useEffect(() => {
    const cycleTimer = window.setInterval(() => {
      setIsScanning(true);
      setIsBooted(false);
      setLoadProgress(23);
      const progressTimerOne = window.setTimeout(() => setLoadProgress(67), 760);
      const progressTimerTwo = window.setTimeout(() => setLoadProgress(100), 1520);
      const revealTimer = window.setTimeout(() => {
        setActiveGame((currentIndex) => (currentIndex + 1) % gameSlides.length);
        setIsBooted(true);
        setIsScanning(false);
      }, 2220);

      window.setTimeout(() => {
        window.clearTimeout(progressTimerOne);
        window.clearTimeout(progressTimerTwo);
        window.clearTimeout(revealTimer);
      }, 2300);
    }, 7000);

    return () => window.clearInterval(cycleTimer);
  }, []);

  useEffect(() => {
    window.localStorage.setItem('fandomverse-theme', theme);
  }, [theme]);

  return (
    <main className={`gaming-page ${theme === 'light' ? 'gaming-theme-light' : ''} ${isBooted ? 'gaming-booted' : ''} ${isScanning ? 'gaming-scanning' : ''}`}>
      <SiteNav theme={theme} setTheme={setTheme} active="gaming" variant="gaming" />

      <section className="gaming-hero" aria-label="Gaming universe introduction">
        <div className="gaming-copy">
          <p className="gaming-kicker"><span /> Gaming / Universe 02</p>
          <h1>ENTER<br /><em>THE GAME</em></h1>
          <p className="gaming-intro">Play. Explore. Compete.<br />Every world is waiting for your next move.</p>
          <a className="gaming-enter-link" href="#gaming-content">Press enter <span>↗</span></a>
        </div>

        <div className="gaming-window">
          <div className="gaming-pink-block gaming-pink-block-one" aria-hidden="true" />
          <div className="gaming-pink-block gaming-pink-block-two" aria-hidden="true" />
          <div className="gaming-pixel-grid" aria-hidden="true" />
          <div className="gaming-particle-field" aria-hidden="true">
            {particleKinds.map((kind, index) => <i className={`gaming-particle gaming-particle-${kind}`} key={`${kind}-${index}`}>{kind === 'controller' ? '⌁' : kind === 'cross' ? '+' : kind === 'diamond' ? '◇' : ''}</i>)}
          </div>

          <div className="gaming-stage-wrap">
            <div className="gaming-stage">
              <div className="gaming-stage-surface" aria-hidden="true" />
              <div className="gaming-radar-crosshair" aria-hidden="true"><i /><i /></div>
              <div className="gaming-hud gaming-hud-player"><b>PLAYER 01</b><span>ACTIVE USER</span></div>
              <div className="gaming-hud gaming-hud-system"><b>SYSTEM ONLINE</b><span>READY / 2048</span></div>
              <div className="gaming-hud gaming-hud-level"><b>LEVEL 01</b><span>FIRST RUN</span></div>
              <div className="gaming-hud gaming-hud-ready"><b>READY?</b><span>YES / NO</span></div>
              <img className="gaming-character" key={gameSlides[activeGame]} src={gameSlides[activeGame]} alt="Featured gaming character" />
              <div className="gaming-scan-beam" aria-hidden="true" />
              <span className="gaming-stage-index">GAMING / 02</span>
            </div>
          </div>

          <aside className="gaming-status-panel">
            <p className="gaming-status-kicker"><span /> Game status</p>
            <h2>LIVE<br /><em>SESSION</em></h2>
            <div className="gaming-status-row"><span>Mode</span><strong>EXPLORE</strong></div>
            <div className="gaming-status-row"><span>Players online</span><strong>12,084</strong></div>
            <div className="gaming-status-row"><span>Next unlock</span><strong>LEVEL 02</strong></div>
            <div className="gaming-status-meter"><span>Connection</span><i><b /></i><strong>98%</strong></div>
          </aside>

          <div className="gaming-loading"><span>LOADING ASSETS</span><strong>{loadProgress}%</strong><i><b style={{ width: `${loadProgress}%` }} /></i></div>
          <a className="gaming-bottom-prompt" id="gaming-content" href="#gaming-content"><span>PRESS ENTER</span><i>→</i><b>EXPLORE GAMING</b></a>
        </div>
      </section>
    </main>
  );
}

export default Gaming;
