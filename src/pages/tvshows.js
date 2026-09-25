import { useEffect, useState } from 'react';
import SiteNav from '../components/SiteNav';
import './tvshows.css';

const tvShows = [
  {
    title: 'STRANGER THINGS',
    index: '01',
    genre: 'SCI-FI / HORROR / MYSTERY',
    year: '2016',
    image: '/assets/images/tv%20show%201.png',
    tagline: 'The town where nothing stays buried.',
    description: 'In Hawkins, a missing boy, a mysterious girl, and a hidden dimension pull a group of friends into a supernatural mystery.',
    cast: 'Millie Bobby Brown / David Harbour / Finn Wolfhard',
    characters: 'ELEVEN / HOPPER / MIKE',
  },
  {
    title: 'RED NOTICE',
    index: '02',
    genre: 'ACTION / HEIST / COMEDY',
    year: '2021',
    image: '/assets/images/tv%20show%202.png',
    tagline: 'Three rivals. One impossible score.',
    description: 'An FBI profiler teams with a brilliant art thief to catch the world’s most wanted criminal in a globe-spanning chase.',
    cast: 'Dwayne Johnson / Gal Gadot / Ryan Reynolds',
    characters: 'JOHN HARTLEY / THE BISHOP / NOLAN BOOTH',
  },
  {
    title: 'FORMULA',
    index: '03',
    genre: 'THRILLER / INTELLIGENCE / DRAMA',
    year: '2024',
    image: '/assets/images/tv%20show%203.png',
    tagline: 'Every answer changes the equation.',
    description: 'A covert team follows a coded formula through London’s hidden networks, where every solution exposes a deeper conspiracy.',
    cast: 'ENSEMBLE INTELLIGENCE UNIT',
    characters: 'MARA VOSS / ELIAS HART / DIRECTOR SHAW',
  },
  {
    title: 'STUDY GROUP',
    index: '04',
    genre: 'ACTION COMEDY / TEEN / COMING-OF-AGE',
    year: '2025',
    image: '/assets/images/tv%20show%204.png',
    tagline: 'Bad grades. Good fighters.',
    description: 'Yoon Ga-min forms a study group at a difficult school, fighting through chaos to reach his dream of university.',
    cast: 'Hwang Min-hyun / Han Ji-eun / Cha Woo-min',
    characters: 'YOON GA-MIN / LEE HAN-KYUNG / PI HAN-WOOL',
  },
];

function TvShows() {
  const [theme, setTheme] = useState(() => window.localStorage.getItem('fandomverse-theme') || 'dark');
  const [activeIndex, setActiveIndex] = useState(0);
  const activeShow = tvShows[activeIndex];

  useEffect(() => {
    window.localStorage.setItem('fandomverse-theme', theme);
  }, [theme]);

  useEffect(() => {
    const cycle = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % tvShows.length);
    }, 6000);
    return () => window.clearInterval(cycle);
  }, []);

  const selectShow = (index) => setActiveIndex(index);
  const previousShow = () => setActiveIndex((activeIndex - 1 + tvShows.length) % tvShows.length);
  const nextShow = () => setActiveIndex((activeIndex + 1) % tvShows.length);

  return (
    <main className={`tvshows-page ${theme === 'light' ? 'tvshows-theme-light' : 'tvshows-theme-dark'}`}>
      <SiteNav theme={theme} setTheme={setTheme} active="tv-shows" variant="tvshows" />
      <section className="tvshows-hero" aria-label="TV Shows carousel">
        <div className="tvshows-crystal" aria-hidden="true" />
        <div className="tvshows-frame">
          <div className="tvshows-masthead"><span>FANDOMVERSE / TV SHOWS</span><b>ON AIR / 04</b><i>SEASONAL SIGNAL</i></div>
          <div className="tvshows-slides" aria-live="polite">
            {tvShows.map((show, index) => (
              <div className={`tvshows-slide ${index === activeIndex ? 'is-active' : ''}`} key={show.image} aria-hidden={index !== activeIndex}>
                <img src={show.image} alt={`${show.title} visual`} />
              </div>
            ))}
          </div>
          <div className="tvshows-slide-wash" aria-hidden="true" />
          <div className="tvshows-copy" key={activeShow.image}>
            <p className="tvshows-kicker"><span /> FEATURED SERIES / {activeShow.index}</p>
            <p className="tvshows-index">{activeShow.genre} <b>—</b> {activeShow.year}</p>
            <h1>{activeShow.title}</h1>
            <p className="tvshows-tagline">{activeShow.tagline}</p>
            <p className="tvshows-description">{activeShow.description}</p>
            <div className="tvshows-info"><span><b>CAST</b>{activeShow.cast}</span><span><b>KEY PLAYERS</b>{activeShow.characters}</span></div>
            <a className="tvshows-cta" href="#tv-shows-details">View series <span>↗</span></a>
          </div>
          <div className="tvshows-side-code" aria-hidden="true"><span>RED / BLACK / GREY</span><b>FRAME {activeShow.index}</b></div>
          <div className="tvshows-controls">
            <button type="button" onClick={previousShow} aria-label="Previous TV show">←</button>
            <div className="tvshows-dots">{tvShows.map((show, index) => <button type="button" className={index === activeIndex ? 'is-active' : ''} onClick={() => selectShow(index)} key={show.index} aria-label={`Show ${index + 1}: ${show.title}`} />)}</div>
            <button type="button" onClick={nextShow} aria-label="Next TV show">→</button>
          </div>
          <div className="tvshows-footer"><span>WATCH THE FRAME / FOLLOW THE STORY</span><span>SCROLL TO DISCOVER ↓</span></div>
        </div>
      </section>
    </main>
  );
}

export default TvShows;
