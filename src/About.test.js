import { fireEvent, render, screen, within } from '@testing-library/react';
import fs from 'fs';
import path from 'path';
import About from './pages/about';

const CSS = fs.readFileSync(path.join(__dirname, 'pages/about.css'), 'utf8');
const FANDOMS = ['Anime', 'Gaming', 'Movies', 'TV Shows', 'K-Pop', 'Comics', 'Manga'];

const mount = () => render(<About />);
const nodes = (container) => [...container.querySelectorAll('.ab-node')];
const detail = (container) => container.querySelector('.ab-map-detail');

beforeEach(() => { window.localStorage.clear(); });

describe('the about page', () => {
  it('leads with the story heading and a short intro', () => {
    const { container } = mount();
    const hero = container.querySelector('.ab-hero');

    expect(hero.querySelector('h1').textContent).toContain('THE STORY BEHIND');
    expect(hero.querySelector('h1 em').textContent).toBe('FANDOMVERSE');
    expect(hero.querySelector('.ab-lede').textContent.length).toBeLessThan(400);
    expect(container.querySelector('.universal-nav-about')).toBeInTheDocument();
  });

  it('keeps every section the page is meant to have', () => {
    const { container } = mount();
    const headings = [...container.querySelectorAll('h2')].map((node) => node.textContent);

    expect(headings).toEqual(expect.arrayContaining([
      'WHY FANDOMVERSE',
      'FANDOM UNIVERSE MAP',
      'THE PEOPLE BEHIND IT',
      'OUR MISSION',
    ]));
    expect(container.querySelectorAll('.ab-why-card')).toHaveLength(3);
    expect(container.querySelectorAll('.ab-member')).toHaveLength(4);
  });

  it('connects the seven fandoms in one universe map', () => {
    const { container } = mount();
    const map = container.querySelector('.ab-map');

    expect(nodes(container).map((node) => node.textContent)).toEqual(FANDOMS);
    // One hub with every fandom orbiting it, so the map reads as a system.
    expect(map.querySelector('.ab-hub-core').textContent).toBe('FANDOMVERSE');
    expect(map.querySelectorAll('.ab-satellite')).toHaveLength(7);
    FANDOMS.forEach((fandom) => {
      expect(map.querySelector(`.ab-satellite`).textContent).toBe('Anime');
      expect([...map.querySelectorAll('.ab-satellite')].some((node) => node.textContent === fandom)).toBe(true);
    });
    expect(detail(container).textContent).toContain('Anime');
  });

  it('redraws the map when a different fandom is chosen', () => {
    const { container } = mount();

    fireEvent.click(nodes(container).find((node) => node.textContent === 'K-Pop'));
    expect(detail(container).textContent).toContain('K-Pop');
    expect(detail(container).querySelector('h3').textContent).toBe('K-Pop');
    expect(nodes(container).find((node) => node.textContent === 'K-Pop').getAttribute('aria-selected')).toBe('true');
    expect(nodes(container).find((node) => node.textContent === 'Anime').getAttribute('aria-selected')).toBe('false');
    // Only the chosen node lights up on the ring.
    expect(container.querySelectorAll('.ab-satellite.is-active')).toHaveLength(1);
  });

  it('marks the map up as a tab set for keyboard and screen readers', () => {
    const { container } = mount();
    const map = container.querySelector('.ab-map');

    expect(map.querySelector('[role="tablist"]')).toBeInTheDocument();
    nodes(container).forEach((node) => {
      expect(node.getAttribute('role')).toBe('tab');
      expect(node.getAttribute('aria-controls')).toBe('ab-map-detail');
    });
    const panel = detail(container);
    expect(panel.getAttribute('role')).toBe('tabpanel');
    expect(panel.getAttribute('aria-labelledby')).toBe('ab-tab-anime');
  });

  it('uses images that exist and repaints for the light theme', () => {
    const { container } = mount();

    container.querySelectorAll('img').forEach((node) => {
      expect(fs.existsSync(path.join(__dirname, '../public', node.getAttribute('src')))).toBe(true);
    });
    expect(container.querySelector('.ab-page').className).toContain('theme-dark');
    fireEvent.click(within(container.querySelector('.universal-nav')).getByRole('button', { name: /switch to light theme/i }));
    expect(container.querySelector('.ab-page').className).toContain('theme-light');
    expect(window.localStorage.getItem('about-theme')).toBe('light');

    // Every ink colour flips with the theme, so nothing stays unreadable. The
    // light stage is a deep lavender, not near-white, and it carries a pattern.
    expect(CSS).toMatch(/\.ab-page\.theme-light \{[^}]*--ink: #1a1030/);
    expect(CSS).toMatch(/\.ab-page\.theme-light \{[^}]*--muted: #6a5d84/);
    expect(CSS).toMatch(/\.ab-page\.theme-light \{[^}]*#e7dcff/);
    expect(CSS).toMatch(/\.theme-light \.ab-page::after \{[^}]*repeating-linear-gradient/);
    // The hero is dressed with geometry and a stat strip instead of empty space.
    expect(CSS).toMatch(/\.ab-hero-shapes \{[^}]*position: absolute/);
    expect(CSS).toMatch(/\.ab-shape\.is-ring \{/);
    expect(CSS).toMatch(/\.ab-shape\.is-shard \{/);
    expect(CSS).toMatch(/\.ab-hero-stats \{[^}]*grid-template-columns: repeat\(3/);
    expect(container.querySelectorAll('.ab-shape').length).toBeGreaterThanOrEqual(6);
    expect(container.querySelector('.ab-shape.is-dot')).toBeInTheDocument();
    // The footer no longer floats above an empty band at the bottom.
    expect(CSS).toMatch(/\.ab-page \{[^}]*padding-bottom: 80px/);
    expect(CSS).toContain('@media (prefers-reduced-motion: reduce)');
  });

  it('keeps the text short and links onward', () => {
    const { container } = mount();
    const copy = container.textContent;

    expect(copy.length).toBeLessThan(2600);
    expect(container.querySelector('.ab-cta').getAttribute('href')).toBe('#shop');
    expect(screen.getAllByRole('link', { name: /talk to us/i })[0].getAttribute('href')).toBe('#contact');
  });
});
