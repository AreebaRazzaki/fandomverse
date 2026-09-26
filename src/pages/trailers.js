import { useEffect, useMemo, useRef, useState } from 'react';
import SiteNav from '../components/SiteNav';
import SiteFooter from '../components/SiteFooter';
import BookmarkButton from '../components/BookmarkButton';
import CanvasField from '../components/CanvasField';
import './trailers.css';

const TRAILERS_URL = '/assets/json%20data/trailers.json';

const FANDOMS = [
  { id: 'all', label: 'All' },
  { id: 'anime', label: 'Anime' },
  { id: 'gaming', label: 'Gaming' },
  { id: 'movies', label: 'Movies' },
  { id: 'tv', label: 'TV' },
  { id: 'kpop', label: 'K-Pop' },
  { id: 'comics', label: 'Comics' },
  { id: 'manga', label: 'Manga' },
];

const STATUSES = [
  { id: 'all', label: 'All Status' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'released', label: 'Released' },
];

// Used only when YouTube's thumbnail host is unreachable, so a card is never blank.
const FALLBACK_ART = {
  anime: '/assets/images/anime.png',
  gaming: '/assets/images/gaming.png',
  movies: '/assets/images/movie.png',
  tv: '/assets/images/tv shows.png',
  kpop: '/assets/images/k-pop.png',
  comics: '/assets/images/comics.png',
  manga: '/assets/images/manga.png',
};

// Blurred movie-frame texture for the hero, taken from artwork already in the repo.
const HERO_FRAMES = [
  '/assets/images/glass.jpg',
  '/assets/images/avengers.jpg',
  '/assets/images/joker.jpg',
  '/assets/images/jumanji.jpg',
  '/assets/images/harry-potter.jpg',
  '/assets/images/la-casa-de-papel.jpg',
  '/assets/images/kpop1.jpg',
  '/assets/images/my-trip.jpg',
];

const PAGE_SIZE = 9;

const thumbFor = (videoId) => `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
const watchUrl = (videoId) => `https://www.youtube.com/watch?v=${videoId}`;
const embedUrl = (videoId, autoplay) =>
  `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1${autoplay ? '&autoplay=1' : ''}`;

const asDate = (value) => new Date(`${value}T00:00:00`).getTime();

const formatDate = (value) => new Date(`${value}T00:00:00`).toLocaleDateString('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

let inflight = null;

const loadTrailers = () => {
  if (!inflight) {
    inflight = fetch(TRAILERS_URL)
      .then((response) => {
        if (!response.ok) throw new Error('Request failed');
        return response.json();
      })
      .catch((error) => {
        inflight = null;
        throw error;
      })
      .finally(() => { inflight = null; });
  }
  return inflight;
};

const useTrailers = () => {
  const [state, setState] = useState({ status: 'loading', trailers: [], issue: null, tagline: '', featuredId: null });
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let active = true;
    setState((current) => ({ ...current, status: 'loading' }));
    loadTrailers()
      .then((data) => {
        if (active) {
          setState({
            status: 'ready',
            trailers: data.trailers,
            issue: data.issue,
            tagline: data.tagline,
            featuredId: data.featuredId,
          });
        }
      })
      .catch(() => {
        if (active) setState({ status: 'error', trailers: [], issue: null, tagline: '', featuredId: null });
      });
    return () => { active = false; };
  }, [nonce]);

  return { ...state, retry: () => setNonce((value) => value + 1) };
};

const labelFor = (id) => (FANDOMS.find((item) => item.id === id) || { label: id }).label;

function Trailers() {
  const { status, trailers, issue, tagline, featuredId, retry } = useTrailers();
  const [theme, setTheme] = useState(() => window.localStorage.getItem('trailers-theme') || 'dark');
  const [fandom, setFandom] = useState('all');
  const [release, setRelease] = useState('all');
  const [activeId, setActiveId] = useState(null);
  const [autoplay, setAutoplay] = useState(false);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const playerRef = useRef(null);
  const heroRef = useRef(null);

  useEffect(() => {
    window.localStorage.setItem('trailers-theme', theme);
  }, [theme]);

  // The hero lights up wherever the pointer goes, so the opening shot answers back.
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return undefined;
    const track = (event) => {
      const rect = hero.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      // Some pointer sources arrive without coordinates; skip rather than
      // writing NaN into a custom property.
      if (!Number.isFinite(event.clientX) || !Number.isFinite(event.clientY)) return;
      const x = Math.min(100, Math.max(0, ((event.clientX - rect.left) / rect.width) * 100));
      const y = Math.min(100, Math.max(0, ((event.clientY - rect.top) / rect.height) * 100));
      hero.style.setProperty('--mx', `${x.toFixed(2)}%`);
      hero.style.setProperty('--my', `${y.toFixed(2)}%`);
      hero.classList.add('is-lit');
    };
    const reset = () => {
      hero.style.setProperty('--mx', '50%');
      hero.style.setProperty('--my', '34%');
      hero.classList.remove('is-lit');
    };
    hero.addEventListener('pointermove', track);
    hero.addEventListener('pointerleave', reset);
    return () => {
      hero.removeEventListener('pointermove', track);
      hero.removeEventListener('pointerleave', reset);
    };
  }, []);

  useEffect(() => {
    setLimit(PAGE_SIZE);
  }, [fandom, release]);

  const featured = useMemo(() => {
    if (!trailers.length) return null;
    return trailers.find((item) => item.id === activeId)
      || trailers.find((item) => item.id === featuredId)
      || trailers[0];
  }, [trailers, activeId, featuredId]);

  const counts = useMemo(() => {
    const map = { all: trailers.length };
    trailers.forEach((item) => {
      map[item.category] = (map[item.category] || 0) + 1;
      map[`status:${item.status}`] = (map[`status:${item.status}`] || 0) + 1;
    });
    return map;
  }, [trailers]);

  const visible = useMemo(() => trailers.filter((item) => {
    const fandomOk = fandom === 'all' || item.category === fandom;
    const releaseOk = release === 'all' || item.status === release;
    return fandomOk && releaseOk;
  }), [trailers, fandom, release]);

  const shown = visible.slice(0, limit);

  // The whole vault shares one axis: the oldest drop on the left, today in the middle, the far future on the right.
  const axis = useMemo(() => {
    if (!trailers.length) return null;
    const times = trailers.map((item) => asDate(item.releaseDate));
    const min = Math.min(...times);
    const max = Math.max(...times);
    const span = max - min || 1;
    const today = new Date();
    const todayTime = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const clamp = (value) => Math.max(1, Math.min(99, ((value - min) / span) * 100));
    return { min, max, today: clamp(todayTime), ticks: trailers.map((item) => ({ id: item.id, at: clamp(asDate(item.releaseDate)) })) };
  }, [trailers]);

  const promote = (item) => {
    setActiveId(item.id);
    setAutoplay(true);
    const player = playerRef.current;
    if (player && typeof player.scrollIntoView === 'function') {
      player.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const isLight = theme === 'light';

  return (
    <main className={`trailers-page ${isLight ? 'theme-light' : 'theme-dark'}`}>
      <div className="vault-bg" aria-hidden="true">
        <CanvasField density={0.9} tone={isLight ? 'dusk' : 'violet'} className={isLight ? 'is-fine' : ''} />
        <span className="vault-beams" />
        <span className="vault-haze vault-haze-one" />
        <span className="vault-haze vault-haze-two" />
        <span className="vault-haze vault-haze-three" />
      <span className="vault-perf" />
      <span className="vault-scan" />
        <span className="vault-grain" />
      </div>

      <SiteNav theme={theme} setTheme={setTheme} active="discover" variant="home" />

      <header className="vault-hero" ref={heroRef}>
        <div className="vault-frames" aria-hidden="true">
          {HERO_FRAMES.map((src, index) => (
            <span className="vault-frame" style={{ '--frame': `url(${src})`, '--frame-delay': `${index * 0.4}s` }} key={src} />
          ))}
        </div>
        <span className="vault-spotlight" aria-hidden="true" />
        <CanvasField density={1.25} tone="sand" className="vault-hero-canvas" trackRef={heroRef} />
        <span className="vault-letterbox vault-letterbox-top" aria-hidden="true" />
        <span className="vault-letterbox vault-letterbox-bottom" aria-hidden="true" />

        <div className="vault-hero-inner">
          <p className="vault-rec"><i /> Reel 01 / {issue ? issue.issue : 'TV-01'} <span className="vault-rec-time">Now playing</span></p>
          <h1>TRAILER <em>VAULT</em></h1>
          <p className="vault-tagline">{tagline || 'Watch what’s coming to your universe.'}</p>

          <p className="vault-hero-rotator">
            <span className="vault-hero-rotator-label">On the radar</span>
            <span className="vault-hero-rotator-words">
              <span>new season drops</span>
              <span>anniversary re-releases</span>
              <span>fan convention first looks</span>
            </span>
          </p>

          <ul className="vault-hero-stats">
            <li><b>{trailers.length}</b><span>Trailers in the vault</span></li>
            <li><b>{FANDOMS.length - 1}</b><span>Fandoms covered</span></li>
            <li><b>{STATUSES.length - 1}</b><span>Release windows</span></li>
          </ul>

          <ul className="vault-hero-hint">
            <li>Move your cursor, the light follows</li>
            <li>Pick a fandom to narrow the reel</li>
            <li>Save a trailer with a private note</li>
          </ul>
        </div>

        <div className="vault-progress" aria-hidden="true">
          <span className="vault-progress-rail" />
          <span className="vault-progress-head" />
        </div>
      </header>

      {status === 'loading' && <p className="vault-note">Threading the reel...</p>}

      {status === 'error' && (
        <div className="vault-note vault-note-error" role="alert">
          <p>The vault did not open.</p>
          <button type="button" onClick={retry}>Try again</button>
        </div>
      )}

      {status === 'ready' && featured && (
        <>
          <section className="vault-featured" ref={playerRef} aria-label="Featured trailer">
            <div className="vault-screen">
              <div className="vault-screen-bar">
                <span className="vault-screen-tag">Featured</span>
                <span className="vault-screen-id">{featured.studio}</span>
                <span className="vault-screen-live"><i /> HD</span>
              </div>
              <div className="vault-embed">
                <iframe
                  key={`${featured.id}-${autoplay}`}
                  title={`${featured.title} official trailer`}
                  src={embedUrl(featured.videoId, autoplay)}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>

            <div className="vault-featured-info">
              <p className="vault-featured-flags">
                <b>{labelFor(featured.category)}</b>
                <i>•</i>
                <b className={`is-${featured.status}`}>{featured.status}</b>
              </p>
              <h2>{featured.title}</h2>
              <p className="vault-featured-blurb">{featured.blurb}</p>
              <dl className="vault-featured-data">
                <div><dt>Release Date</dt><dd>{formatDate(featured.releaseDate)}</dd></div>
                <div><dt>Runtime</dt><dd>{featured.runtime}</dd></div>
                <div><dt>Studio</dt><dd>{featured.studio}</dd></div>
              </dl>
              <div className="vault-featured-actions">
                <button type="button" className="vault-watch" onClick={() => setAutoplay(true)}>
                  <i aria-hidden="true">&#9654;</i> {autoplay ? 'Playing now' : 'Watch trailer'}
                </button>
                <a className="vault-watch vault-watch-ghost" href={watchUrl(featured.videoId)} target="_blank" rel="noreferrer">
                  YouTube <i aria-hidden="true">&#8599;</i>
                </a>
              </div>
            </div>
          </section>

          {axis && (
            <section className="vault-timeline" aria-label="Trailer timeline from released to upcoming">
              <p className="vault-timeline-title">Trailer timeline</p>
              <div className="vault-rail">
                <span className="vault-rail-track" />
                <span className="vault-rail-done" style={{ width: `${axis.today}%` }} />
                {axis.ticks.map((tick) => (
                  <span
                    className={`vault-tick ${featured.id === tick.id ? 'is-active' : ''}`}
                    style={{ left: `${tick.at}%` }}
                    key={tick.id}
                  />
                ))}
                <span className="vault-rail-now" style={{ left: `${axis.today}%` }}><i /> Today</span>
              </div>
              <div className="vault-timeline-ends">
                <span>Released</span>
                <span>Upcoming</span>
              </div>
            </section>
          )}

          <div className="vault-filters">
            <nav className="vault-fandom-bar" aria-label="Filter trailers by fandom">
              {FANDOMS.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className={fandom === item.id ? 'is-active' : ''}
                  aria-pressed={fandom === item.id}
                  onClick={() => setFandom(item.id)}
                >
                  {item.label}
                  <sup>{counts[item.id] || 0}</sup>
                </button>
              ))}
            </nav>
            <div className="vault-status-bar" aria-label="Filter trailers by status">
              {STATUSES.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className={release === item.id ? 'is-active' : ''}
                  aria-pressed={release === item.id}
                  onClick={() => setRelease(item.id)}
                >
                  {item.label}
                  <sup>{item.id === 'all' ? visible.length : counts[`status:${item.id}`] || 0}</sup>
                </button>
              ))}
            </div>
          </div>

          {visible.length === 0 && (
            <p className="vault-note">No trailers on this reel yet. Try another filter.</p>
          )}

          <section className="vault-collection" aria-label="Trailer collection">
            <span className="vault-weave" aria-hidden="true" />
            {shown.map((item) => (
              <article
                className={`trailer-card is-${item.category} status-${item.status}${featured.id === item.id ? ' is-featured' : ''}`}
                key={item.id}
              >
                <span className="trailer-inner">
                  <span className="trailer-rail" aria-hidden="true"><i>{labelFor(item.category)}</i></span>
                  <span className="trailer-thumb">
                    <img
                      src={thumbFor(item.videoId)}
                      alt=""
                      onError={(event) => { event.currentTarget.src = FALLBACK_ART[item.category]; }}
                    />
                    <span className="trailer-veil" aria-hidden="true" />
                    <span className="trailer-glare" aria-hidden="true" />
                    <span className="trailer-play" aria-hidden="true">&#9654;</span>
                    <span className="trailer-runtime">{item.runtime}</span>
                  </span>
                  <span className="trailer-body">
                    <span className="trailer-flags">
                      <b>{labelFor(item.category)}</b>
                      <i>•</i>
                      <b className={`is-${item.status}`}>{item.status}</b>
                    </span>
                    <b className="trailer-title">{item.title}</b>
                    <span className="trailer-date">Release Date <em>{formatDate(item.releaseDate)}</em></span>
                  </span>
                  <span className="trailer-cta" aria-hidden="true">&#9654; Watch</span>
                </span>
                <button
                  type="button"
                  className="trailer-hit"
                  onClick={() => promote(item)}
                  aria-label={`Play ${item.title} in the featured player`}
                />
                <a
                  className="trailer-yt"
                  href={watchUrl(item.videoId)}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Open ${item.title} on YouTube`}
                >yt</a>
                <BookmarkButton
                  className="trailer-save"
                  entry={{
                    id: `trailer:${item.id}`,
                    type: 'trailer',
                    title: item.title,
                    meta: `${labelFor(item.category)} · ${item.status} · ${item.runtime}`,
                    href: '#trailers',
                  }}
                />
              </article>
            ))}
          </section>

          {limit < visible.length && (
            <div className="vault-more">
              <button type="button" onClick={() => setLimit((value) => value + PAGE_SIZE)}>
                More trailers from the universe
                <i aria-hidden="true">&#8594;</i>
              </button>
              <p>{visible.length - shown.length} still on the reel</p>
            </div>
          )}
        </>
      )}

      <SiteFooter />
    </main>
  );
}

export default Trailers;
