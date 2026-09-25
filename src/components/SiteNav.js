import { useState } from 'react';
import './SiteNav.css';

const fandomLinks = ['Anime', 'Gaming', 'Movies', 'TV Shows', 'K-Pop', 'Comics', 'Manga'];
const discoverLinks = ['Featured Articles', 'Trailers', 'Events', 'Upcoming Releases'];

const palettes = {
  home: {
    dark: { '--nav-ink': '#eeeae1', '--nav-muted': '#aaa6a0', '--nav-accent': 'var(--accent, #d89416)' },
    light: { '--nav-ink': '#171820', '--nav-muted': '#5e6068', '--nav-accent': 'var(--accent, #d89416)' },
  },
  anime: {
    dark: { '--nav-ink': '#d6d3cb', '--nav-muted': '#85837d', '--nav-accent': '#c5962e' },
    light: { '--nav-ink': '#252628', '--nav-muted': '#60615f', '--nav-accent': '#aa7711' },
  },
  gaming: {
    dark: { '--nav-ink': '#ffe0f0', '--nav-muted': '#efb1cd', '--nav-accent': '#ff4da4' },
    light: { '--nav-ink': '#42102a', '--nav-muted': '#6b2849', '--nav-accent': '#a81760' },
  },
};

const SearchIcon = () => <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></svg>;
const BookmarkIcon = () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 4.5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v17l-5.5-3.2-5.5 3.2z" /></svg>;
const ThemeIcon = ({ isLight }) => <svg viewBox="0 0 24 24" aria-hidden="true">{isLight ? <path d="M20.5 15.5A8.5 8.5 0 0 1 8.5 3.5a8.2 8.2 0 1 0 12 12z" /> : <><circle cx="12" cy="12" r="3.5" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>}</svg>;

function SiteNav({ theme, setTheme, active = 'home', variant = 'home' }) {
  const [openMenu, setOpenMenu] = useState(null);
  const palette = palettes[variant]?.[theme] || palettes.home.dark;
  const linkId = (label) => `#${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <nav className={`universal-nav universal-nav-${variant}`} style={palette} aria-label="Main navigation">
      <a className="universal-brand" href="#home" aria-label="Fandomverse home"><span className="universal-brand-mark" aria-hidden="true" /><span>FANDOMVERSE</span></a>
      <div className="universal-nav-links">
        <a className={`universal-nav-link ${active === 'home' ? 'is-active' : ''}`} href="#home">Home</a>
        <div className="universal-nav-menu">
          <button type="button" className="universal-nav-link" onClick={() => setOpenMenu(openMenu === 'fandoms' ? null : 'fandoms')} aria-expanded={openMenu === 'fandoms'}>Fandoms <span>⌄</span></button>
          {openMenu === 'fandoms' && <div className="universal-dropdown">{fandomLinks.map((item) => <a href={linkId(item)} key={item}>{item}</a>)}</div>}
        </div>
        <div className="universal-nav-menu">
          <button type="button" className="universal-nav-link" onClick={() => setOpenMenu(openMenu === 'discover' ? null : 'discover')} aria-expanded={openMenu === 'discover'}>Discover <span>⌄</span></button>
          {openMenu === 'discover' && <div className="universal-dropdown universal-discover-dropdown">{discoverLinks.map((item) => <a href={linkId(item)} key={item}>{item}</a>)}</div>}
        </div>
        <a className="universal-nav-link" href="#shop">Shop</a>
      </div>
      <div className="universal-nav-actions">
        <button type="button" className="universal-icon-button" aria-label="Search"><SearchIcon /></button>
        <button type="button" className="universal-icon-button" aria-label="Bookmarks"><BookmarkIcon /></button>
        <button type="button" className="universal-icon-button universal-theme-button" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}><ThemeIcon isLight={theme === 'light'} /><span>{theme === 'dark' ? 'Light' : 'Dark'}</span></button>
        <a className="universal-signin" href="#sign-in">Sign in <b>↗</b></a>
      </div>
    </nav>
  );
}

export default SiteNav;
