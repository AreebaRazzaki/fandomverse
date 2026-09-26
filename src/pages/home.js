import { useCallback, useEffect, useRef, useState } from 'react';
import SiteNav from '../components/SiteNav';
import SiteFooter from '../components/SiteFooter';
import './home.css';

const fandoms = [
  {
    name: 'Anime',
    eyebrow: 'The worlds we grew up in',
    title: 'Where legends are drawn in gold.',
    description:
      'Step into stories that move at the speed of imagination, from impossible battles to characters who stay with you long after the credits.',
    image: '/assets/images/anime.png',
    accent: '#d89416',
    accentSoft: '#58400e',
    mood: 'BLACK / GREY / GOLD',
    tags: ['New episodes', 'Character arcs', 'Fan theories'],
    symbols: ['✦', '◈', '✧'],
    layout: 'anime',
    watermark: 'ANIME',
    motion: 'drop',
    annotation: 'FRAME 001 / ORIGIN STORIES',
    orbitDescription: 'Stories beyond imagination.',
  },
  {
    name: 'Gaming',
    eyebrow: 'Press start on your next obsession',
    title: 'Play loud. Stay legendary.',
    description:
      'From clutch plays to worlds worth getting lost in, find the games, characters, and communities keeping the controller warm.',
    image: '/assets/images/gaming.png',
    accent: '#ee278f',
    accentSoft: '#1e3d9b',
    mood: 'BLACK / PINK / BLUE',
    tags: ['Release radar', 'Build guides', 'Level up'],
    symbols: ['+', '△', '◉'],
    layout: 'gaming',
    watermark: 'PLAY',
    motion: 'slide',
    annotation: 'PLAYER 01 / PRESS START',
    orbitDescription: 'Play. Explore. Become.',
  },
  {
    name: 'Movies',
    eyebrow: 'For the scenes you never forget',
    title: 'Every frame has a story.',
    description:
      'Go beyond the poster and into the details: the performances, worlds, and tiny cinematic moments everyone is talking about.',
    image: '/assets/images/movie.png',
    accent: '#20b7aa',
    accentSoft: '#527c6b',
    mood: 'TEAL / BLACK / SAGE',
    tags: ['Now showing', 'Behind the scenes', 'Watchlists'],
    symbols: ['▣', '✦', '◌'],
    layout: 'movies',
    watermark: 'FILM',
    motion: 'rise',
    annotation: 'REEL 024 / NOW SHOWING',
    orbitDescription: 'Every frame holds a feeling.',
  },
  {
    name: 'TV Shows',
    eyebrow: 'Your next binge starts here',
    title: 'Stay for the next episode.',
    description:
      'Catch the plot twists, unpack the finales, and find your new comfort show among the series shaping the conversation right now.',
    image: '/assets/images/tv shows.png',
    accent: '#e23b2d',
    accentSoft: '#a85a2b',
    mood: 'RED / BLACK / ORANGE',
    tags: ['Episode drops', 'Finales decoded', 'What to watch'],
    symbols: ['▸', '●', '✶'],
    layout: 'tv',
    watermark: 'SERIES',
    motion: 'wipe',
    annotation: 'EPISODE 04 / BINGE MODE',
    orbitDescription: 'Stay for the next episode.',
  },
  {
    name: 'K-Pop',
    eyebrow: 'The sound of the moment',
    title: 'Make some room for the spotlight.',
    description:
      'New eras, iconic stages, and the artists turning every comeback into an event. Your timeline just got a little brighter.',
    image: '/assets/images/k-pop.png',
    accent: '#50c7eb',
    accentSoft: '#dbeaf0',
    mood: 'ICE BLUE / BLACK / WHITE',
    tags: ['Comeback watch', 'Stage fits', 'Fan edits'],
    symbols: ['♡', '✦', '⋆'],
    layout: 'kpop',
    watermark: 'STAGE',
    motion: 'drop',
    annotation: 'LIVE 007 / COMEBACK WATCH',
    orbitDescription: 'Find the sound of the moment.',
  },
  {
    name: 'Comics',
    eyebrow: 'Panels, powers, and perfect chaos',
    title: 'Heroes are made of more than powers.',
    description:
      'Turn the page on the biggest universes, sharpest rivalries, and the artists giving a new shape to the stories we know by heart.',
    image: '/assets/images/comics.png',
    accent: '#ef7027',
    accentSoft: '#e5a17d',
    mood: 'ORANGE / PEACH / BLACK',
    tags: ['Pull list', 'Origin stories', 'Panel by panel'],
    symbols: ['!', '✦', '◆'],
    layout: 'comics',
    watermark: 'POW!',
    motion: 'slide',
    annotation: 'PANEL 099 / HERO FILES',
    orbitDescription: 'Heroes are made on every page.',
  },
  {
    name: 'Manga',
    eyebrow: 'One more chapter',
    title: 'Find the story between the lines.',
    description:
      'Quiet pages, sharp edges, unforgettable journeys. Discover the series and characters that make a late-night reading session inevitable.',
    image: '/assets/images/manga.png',
    accent: '#a889c6',
    accentSoft: '#5b456d',
    mood: 'BEIGE / LAVENDER / INK',
    tags: ['Reading list', 'New volumes', 'Deep cuts'],
    symbols: ['〰', '✧', '○'],
    layout: 'manga',
    watermark: '読 / READ',
    motion: 'rise',
    annotation: 'CHAPTER 013 / DEEP CUTS',
    orbitDescription: 'One more chapter, always.',
  },
];

const portalFandoms = [fandoms[0], fandoms[1], fandoms[5], fandoms[4], fandoms[6], fandoms[2], fandoms[3]];

const SLIDE_MS = 3000;
const GLITCH_MS = 820;

function Home() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isGlitching, setIsGlitching] = useState(false);
  const [theme, setTheme] = useState(() => window.localStorage.getItem('fandomverse-theme') || 'dark');
  const transitionTimer = useRef(null);
  const indexRef = useRef(0);
  const glitchingRef = useRef(false);
  const queuedRef = useRef(null);
  const activeFandom = fandoms[activeIndex];

  // A request that lands while the glitch window is still open waits its turn
  // instead of being dropped, so the rail never misses a press.
  const changeSlide = useCallback((nextIndex) => {
    if (nextIndex === indexRef.current) return;
    if (glitchingRef.current) {
      queuedRef.current = nextIndex;
      return;
    }

    glitchingRef.current = true;
    setIsGlitching(true);
    transitionTimer.current = window.setTimeout(() => {
      const target = queuedRef.current === null ? nextIndex : queuedRef.current;
      queuedRef.current = null;
      glitchingRef.current = false;
      transitionTimer.current = null;
      setActiveIndex(target);
      setIsGlitching(false);
    }, GLITCH_MS);
  }, []);

  useEffect(() => {
    indexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    const autoplayTimer = window.setTimeout(() => {
      changeSlide((indexRef.current + 1) % fandoms.length);
    }, SLIDE_MS);

    return () => window.clearTimeout(autoplayTimer);
  }, [activeIndex, changeSlide]);

  useEffect(() => () => window.clearTimeout(transitionTimer.current), []);

  useEffect(() => {
    window.localStorage.setItem('fandomverse-theme', theme);
  }, [theme]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'ArrowRight') changeSlide((indexRef.current + 1) % fandoms.length);
      if (event.key === 'ArrowLeft') changeSlide((indexRef.current - 1 + fandoms.length) % fandoms.length);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [changeSlide]);

  return (
    <main
      className={`home-page ${theme === 'light' ? 'theme-light' : ''} ${isGlitching ? 'is-glitching' : ''}`}
      style={{
        '--accent': activeFandom.accent,
        '--accent-soft': activeFandom.accentSoft,
      }}
    >
      <SiteNav theme={theme} setTheme={setTheme} active="home" variant="home" />

      <section className={`hero hero-${activeFandom.layout}`} id="home" aria-roledescription="carousel" aria-label="Featured fandoms">
        <div className="hero-grid-lines" aria-hidden="true" />
        <div className="reel-strip reel-strip-left" aria-hidden="true"><span>{activeFandom.name} / {activeFandom.name} / {activeFandom.name} /</span></div>
        <div className="reel-strip reel-strip-right" aria-hidden="true"><span>FV / {activeFandom.annotation} /</span></div>
        <div className={`hero-copy motion-${activeFandom.motion}`} key={`copy-${activeFandom.name}`}>
          <p className="section-kicker"><span className="kicker-line" /> Curated for the obsessed</p>
          <div className="slide-counter"><span>0{activeIndex + 1}</span> / 0{fandoms.length}</div>
          <p className="eyebrow">{activeFandom.eyebrow}</p>
          <h1>{activeFandom.title}</h1>
          <a className="discovery-link" href={`#${activeFandom.name.toLowerCase().replace(' ', '-')}`}>
            <strong aria-label={`Explore ${activeFandom.name}`}>↗</strong>
          </a>
        </div>

        <div className={`hero-art motion-${activeFandom.motion}`} key={`art-${activeFandom.name}`} aria-live="polite">
          <div className="orbit orbit-one" aria-hidden="true" />
          <div className="orbit orbit-two" aria-hidden="true" />
          <div className="wave wave-one" aria-hidden="true" />
          <div className="wave wave-two" aria-hidden="true" />
          <div className="wave wave-three" aria-hidden="true" />
          <div className="glow-disc" aria-hidden="true" />
          <div className="scanline-field" aria-hidden="true" />
          <div className="glitch-bars" aria-hidden="true"><i /><i /><i /><i /><i /></div>
          <div className="particle-field" aria-hidden="true">
            {Array.from({ length: 18 }, (_, index) => <i key={index} />)}
          </div>
          <div className="art-type-note" aria-hidden="true">{activeFandom.annotation}</div>
          <div className="art-symbols" aria-hidden="true">
            {activeFandom.symbols.map((symbol, index) => <span className={`symbol symbol-${index + 1}`} key={symbol}>{symbol}</span>)}
          </div>
          <img className="fandom-character" src={activeFandom.image} alt={`${activeFandom.name} featured character`} />
          <div className="art-caption"><span>FV / 07</span><span>EST. 2024</span></div>
        </div>

        <aside className="hero-rail">
          <div className="rail-topline"><span className="rail-pulse" /> Live fandom index</div>
          <div className="rail-category">0{activeIndex + 1}<span>/ 0{fandoms.length}</span></div>
          <p className="rail-heading">Explore the<br /><strong>{activeFandom.name}</strong><br />universe.</p>
          <div className="rail-line" />
          <div className="rail-list">
            {activeFandom.tags.map((tag, index) => <span key={tag}><b>0{index + 1}</b>{tag}</span>)}
          </div>
          <div className="rail-stamp">{activeFandom.annotation}</div>
        </aside>

        <div className="carousel-controls carousel-indicator">
          <div className="carousel-dots" role="tablist" aria-label="Choose fandom">
            {fandoms.map((fandom, index) => (
              <button
                type="button"
                role="tab"
                aria-selected={activeIndex === index}
                aria-label={`Show ${fandom.name}`}
                className={`carousel-dot ${activeIndex === index ? 'selected' : ''}`}
                onClick={() => changeSlide(index)}
                key={fandom.name}
              />
            ))}
          </div>
        </div>
        <footer className="hero-footer"><span>Scroll to discover</span><span className="footer-rule" /><span>01 — 07</span></footer>
      </section>

      <section className="universe-section" id="universe" aria-labelledby="universe-title">
        <div className="universe-heading">
          <div>
            <p className="universe-kicker"><span /> Fandom Portal / 07 doors</p>
            <h2 id="universe-title">CHOOSE YOUR <em>UNIVERSE</em></h2>
          </div>
          <p className="universe-intro">One portal. Seven worlds.<br /><strong>Endless fandoms.</strong></p>
        </div>
        <div className="portal-field">
          <div className="portal-thread portal-thread-one" aria-hidden="true" />
          <div className="portal-thread portal-thread-two" aria-hidden="true" />
          {portalFandoms.map((fandom, index) => (
            <a
              className={`portal-card portal-${fandom.layout}`}
              href={`#${fandom.name.toLowerCase().replace(' ', '-')}`}
              key={fandom.name}
              style={{ '--portal-accent': fandom.accent }}
            >
              <span className="portal-index">0{index + 1}</span>
              <span className="portal-label">Fandom Portal</span>
              <span className="portal-shape" aria-hidden="true" />
              <img src={fandom.image} alt={`${fandom.name} portal`} />
              <span className="portal-card-footer"><b>{fandom.name}</b><small>EXPLORE <i>↗</i></small></span>
            </a>
          ))}
        </div>
      </section>

      <section className={`frequency-section frequency-${activeFandom.layout}`} style={{ '--frequency-accent': activeFandom.accent }} aria-labelledby="frequency-title">
        <div className="frequency-topline"><span>03 / 04</span><p><i /> Fandom frequency</p><span>Live / auto-syncing</span></div>
        <div className="frequency-frame">
          <div className="frequency-copy" key={`frequency-copy-${activeFandom.name}`}>
            <p className="frequency-kicker">What&apos;s alive in the verse</p>
            <h2 id="frequency-title">FANDOM<br /><em>FREQUENCY</em></h2>
            <p className="frequency-intro">A live pulse from the worlds you keep coming back to.</p>
          </div>
          <div className="frequency-console" key={`frequency-console-${activeFandom.name}`} aria-label={`${activeFandom.name} live signal`}>
            <div className="frequency-orbit frequency-orbit-one" aria-hidden="true" />
            <div className="frequency-orbit frequency-orbit-two" aria-hidden="true" />
            <div className="frequency-core"><span>{activeFandom.name.slice(0, 1)}</span><i /></div>
            <span className="frequency-node frequency-node-one" aria-hidden="true" />
            <span className="frequency-node frequency-node-two" aria-hidden="true" />
            <span className="frequency-node frequency-node-three" aria-hidden="true" />
            <span className="frequency-console-label">{activeFandom.name.toUpperCase()} / 0{activeIndex + 1}</span>
          </div>
          <div className="frequency-data">
            <div className="frequency-data-heading"><span /> Currently tuned to</div>
            <strong>{activeFandom.name.toUpperCase()}</strong>
            <p>{activeFandom.orbitDescription}</p>
            <div className="frequency-bars" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
            <div className="frequency-topics">{activeFandom.tags.map((tag, index) => <span key={tag}><b>0{index + 1}</b>{tag}</span>)}</div>
          </div>
        </div>
        <div className="frequency-footer"><span>Signal moving through the verse</span><i /><span>0{activeIndex + 1} / 0{fandoms.length}</span></div>
      </section>

      <SiteFooter />

    </main>
  );
}

export default Home;
