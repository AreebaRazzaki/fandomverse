import { useEffect, useState } from 'react';
import SiteNav from '../components/SiteNav';
import './anime.css';

const animeSlides = [
  { image: '/assets/images/anime1.png', title: 'A world built for the brave.', detail: 'Characters, quests, and stories that refuse to stay inside the lines.' },
  { image: '/assets/images/anime2.png', title: 'Soft hearts. Strong spirits.', detail: 'Find the quiet moments and unforgettable journeys behind every arc.' },
  { image: '/assets/images/anime3.png', title: 'Power has a price.', detail: 'Enter a universe of impossible abilities, sharp choices, and red-line energy.' },
  { image: '/assets/images/anime4.png', title: 'Every shadow has a story.', detail: 'Discover the characters who make danger look elegant and personal.' },
  { image: '/assets/images/anime5.png', title: 'Magic lives between chapters.', detail: 'Follow strange worlds, ancient rules, and the people rewriting both.' },
  { image: '/assets/images/anime6.png', title: 'The dark always answers back.', detail: 'Meet the legends waiting at the edge of the next great adventure.' },
];

function Anime() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isChanging, setIsChanging] = useState(false);
  const [theme, setTheme] = useState(() => window.localStorage.getItem('fandomverse-theme') || 'dark');
  const activeSlide = animeSlides[activeIndex];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIsChanging(true);
      window.setTimeout(() => {
        setActiveIndex((currentIndex) => (currentIndex + 1) % animeSlides.length);
      }, 720);
      window.setTimeout(() => setIsChanging(false), 1420);
    }, 6500);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    window.localStorage.setItem('fandomverse-theme', theme);
  }, [theme]);

  const selectSlide = (index) => {
    if (index === activeIndex || isChanging) return;
    setIsChanging(true);
    window.setTimeout(() => {
      setActiveIndex(index);
    }, 720);
    window.setTimeout(() => setIsChanging(false), 1420);
  };

  return (
    <main className={`anime-page ${theme === 'light' ? 'anime-theme-light' : ''} ${isChanging ? 'anime-is-changing' : ''}`}>
      <SiteNav theme={theme} setTheme={setTheme} active="anime" variant="anime" />

      <section className="anime-hero" aria-label="Anime universe introduction">
        <div className="anime-canvas-block anime-canvas-one" aria-hidden="true" />
        <div className="anime-canvas-block anime-canvas-two" aria-hidden="true" />
        <div className="anime-canvas-block anime-canvas-three" aria-hidden="true" />
        <div className="anime-canvas-collage" aria-hidden="true"><span /><span /><span /><i /><i /><i /></div>
        <div className="anime-background-characters" aria-hidden="true"><span>ANIME</span><span>UNIVERSE</span></div>
        <div className="anime-background-system" aria-hidden="true">
          <span className="anime-bg-icon anime-bg-icon-one">✦</span>
          <span className="anime-bg-icon anime-bg-icon-two">＋</span>
          <span className="anime-bg-icon anime-bg-icon-three">◇</span>
          <span className="anime-bg-icon anime-bg-icon-four">◌</span>
          <span className="anime-bg-stamp anime-bg-stamp-one">ARCHIVE / 001</span>
          <span className="anime-bg-stamp anime-bg-stamp-two">FV — ANIME / 07</span>
          <span className="anime-bg-rule anime-bg-rule-one" />
          <span className="anime-bg-rule anime-bg-rule-two" />
          <span className="anime-bg-square anime-bg-square-one" />
          <span className="anime-bg-square anime-bg-square-two" />
        </div>

        <div className="anime-hero-copy">
          <p className="anime-kicker"><span /> Category 01 / Fandom hub</p>
          <h1>ANIME<br /><em>UNIVERSE</em></h1>
          <p className="anime-intro">Step beyond the screen into stories of impossible worlds, unforgettable heroes, and the moments that make every arc matter.</p>
          <a className="anime-discover-link" href="#anime-content">Enter the universe <span>↗</span></a>
        </div>

        <div className="anime-stage-wrap">
          <div className="anime-stage" key={activeSlide.image}>
            <div className="anime-stage-shape" aria-hidden="true" />
            <div className="anime-stage-grid" aria-hidden="true" />
            <div className="anime-glitch-lines" aria-hidden="true"><i /><i /><i /><i /></div>
            <img className="anime-stage-image" src={activeSlide.image} alt="Featured anime character" />
            <img className="anime-glitch-copy anime-glitch-copy-one" src={activeSlide.image} alt="" aria-hidden="true" />
            <img className="anime-glitch-copy anime-glitch-copy-two" src={activeSlide.image} alt="" aria-hidden="true" />
            <span className="anime-stage-index">0{activeIndex + 1} / 0{animeSlides.length}</span>
          </div>
        </div>

        <aside className="anime-side-panel">
          <p className="anime-side-kicker">Featured character</p>
          <h2 key={`title-${activeSlide.image}`}>{activeSlide.title}</h2>
          <p className="anime-side-detail" key={`detail-${activeSlide.image}`}>{activeSlide.detail}</p>
          <div className="anime-signal"><span>Signal / active</span><i><b /></i><strong>94%</strong></div>
          <div className="anime-slide-nav" role="tablist" aria-label="Featured anime characters">
            {animeSlides.map((slide, index) => <button type="button" role="tab" aria-selected={activeIndex === index} aria-label={`Show anime character ${index + 1}`} className={activeIndex === index ? 'active' : ''} onClick={() => selectSlide(index)} key={slide.image}><span>0{index + 1}</span></button>)}
          </div>
        </aside>

        <div className="anime-stats" id="anime-content"><span><b>07</b> story worlds</span><span><b>24</b> featured arcs</span><span><b>∞</b> late-night theories</span></div>
      </section>
    </main>
  );
}

export default Anime;
