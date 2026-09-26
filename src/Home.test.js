import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import Home from './pages/home';

const fandomNames = ['Anime', 'Gaming', 'Movies', 'TV Shows', 'K-Pop', 'Comics', 'Manga'];

const slideCounter = () => document.querySelector('.slide-counter').textContent;
const selectedDot = () => [...document.querySelectorAll('.carousel-dot')].findIndex((dot) => dot.classList.contains('selected'));
const isGlitching = () => document.querySelector('.home-page').classList.contains('is-glitching');

const advance = (ms) => {
  act(() => { jest.advanceTimersByTime(ms); });
};

describe('home hero carousel', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    window.localStorage.clear();
    global.fetch = jest.fn(() => new Promise(() => {}));
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('advances one fandom every three seconds', () => {
    render(<Home />);
    const total = document.querySelectorAll('.carousel-dot').length;

    expect(total).toBeGreaterThan(2);
    expect(slideCounter()).toContain('01');

    // Nothing moves before the beat is up.
    advance(2999);
    expect(selectedDot()).toBe(0);

    // The glitch opens, and the slide lands when the window closes.
    advance(1);
    expect(isGlitching()).toBe(true);
    advance(820);
    expect(selectedDot()).toBe(1);
    expect(isGlitching()).toBe(false);
    expect(slideCounter()).toContain('02');

    // The next beat restarts from the new slide, so it never doubles up.
    advance(3000 + 820);
    expect(selectedDot()).toBe(2);
    expect(isGlitching()).toBe(false);
  });

  it('wraps back to the first fandom after the last one', () => {
    render(<Home />);
    const total = document.querySelectorAll('.carousel-dot').length;

    for (let step = 0; step < total; step += 1) {
      advance(3000 + 820);
    }

    expect(selectedDot()).toBe(0);
    expect(slideCounter()).toContain(`01 / 0${total}`);
  });

  it('queues a press that lands mid glitch instead of dropping it', () => {
    render(<Home />);
    const dots = [...document.querySelectorAll('.carousel-dot')];
    const last = dots.length - 1;

    // Open the glitch, then aim somewhere else while it is still running.
    fireEvent.click(dots[1]);
    fireEvent.click(dots[last]);
    expect(isGlitching()).toBe(true);
    expect(selectedDot()).toBe(0);

    advance(820);
    expect(selectedDot()).toBe(last);
    expect(isGlitching()).toBe(false);
  });

  it('ignores a press on the slide that is already showing', () => {
    render(<Home />);
    fireEvent.click(document.querySelectorAll('.carousel-dot')[0]);

    expect(isGlitching()).toBe(false);
    expect(selectedDot()).toBe(0);

    // Still nothing: the press never opened a transition of its own.
    advance(2999);
    expect(isGlitching()).toBe(false);
    expect(selectedDot()).toBe(0);
  });

  it('steps with the arrow keys and never stacks two transitions', () => {
    render(<Home />);

    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(isGlitching()).toBe(true);
    advance(820);
    expect(selectedDot()).toBe(1);
    expect(isGlitching()).toBe(false);

    // A second press during the window queues instead of opening another one.
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(isGlitching()).toBe(true);
    advance(820);
    expect(selectedDot()).toBe(2);
    expect(isGlitching()).toBe(false);

    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    advance(820);
    expect(selectedDot()).toBe(1);
  });

  it('clears the transition when the page unmounts', async () => {
    const view = render(<Home />);
    fireEvent.click(document.querySelectorAll('.carousel-dot')[2]);

    view.unmount();
    await waitFor(() => expect(view.container).toBeEmptyDOMElement());
    expect(() => advance(5000)).not.toThrow();
    expect(screen.queryByRole('tablist', { name: /choose fandom/i })).toBeNull();
  });

  it('names every fandom on the rail', () => {
    render(<Home />);
    const labels = [...document.querySelectorAll('.carousel-dot')].map((dot) => dot.getAttribute('aria-label'));
    fandomNames.forEach((name) => expect(labels).toContain(`Show ${name}`));
  });
});
