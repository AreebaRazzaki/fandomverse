import { fireEvent, render, waitFor, within } from '@testing-library/react';
import fs from 'fs';
import path from 'path';
import Contact from './pages/contact';

const CSS = fs.readFileSync(path.join(__dirname, 'pages/contact.css'), 'utf8');

const mount = () => render(<Contact />);
const field = (container, name) => container.querySelector(`#ct-${name}`);

const fill = (container, values) => {
  Object.entries(values).forEach(([name, value]) => {
    fireEvent.change(field(container, name), { target: { value } });
  });
};

const submit = (container) => {
  fireEvent.click(container.querySelector('.ct-send'));
};

beforeEach(() => { window.localStorage.clear(); });

describe('the contact page', () => {
  it('greets with the heading and shows how to reach the studio', () => {
    const { container } = mount();

    expect(container.querySelector('.ct-hero h1').textContent).toContain('TALK TO THE');
    expect(container.querySelector('.ct-hero h1 em').textContent).toBe('FANDOMVERSE');

    const details = container.querySelector('.ct-details');
    expect(details.querySelector('a[href^="mailto:"]')).toBeInTheDocument();
    expect(details.querySelector('a[href^="tel:"]')).toBeInTheDocument();
    expect(details.textContent).toMatch(/Karachi/i);
    expect(details.querySelectorAll('.ct-socials li')).toHaveLength(4);
    expect(container.querySelector('.universal-nav-contact')).toBeInTheDocument();
  });

  it('labels every field instead of relying on placeholders', () => {
    const { container } = mount();
    ['name', 'email', 'subject', 'message'].forEach((name) => {
      const label = container.querySelector(`label[for="ct-${name}"]`);
      expect(label).toBeInTheDocument();
      expect(label.textContent.trim().length).toBeGreaterThan(0);
      expect(field(container, name)).toBeInTheDocument();
    });
    expect(field(container, 'email').getAttribute('type')).toBe('email');
  });

  it('refuses an empty form and says what is missing', () => {
    const { container } = mount();
    submit(container);

    expect(container.querySelectorAll('.ct-error')).toHaveLength(4);
    ['name', 'email', 'subject', 'message'].forEach((name) => {
      expect(field(container, name).getAttribute('aria-invalid')).toBe('true');
      expect(field(container, name).getAttribute('aria-describedby')).toBe(`ct-${name}-error`);
    });
    expect(container.querySelector('.ct-sent')).toBeNull();
  });

  it('catches a malformed email and a too-short message', () => {
    const { container } = mount();
    fill(container, { name: 'Areeba', email: 'areeba@', subject: 'Order', message: 'hi' });
    submit(container);

    expect(container.querySelector('#ct-email-error').textContent).toMatch(/does not look right/i);
    expect(container.querySelector('#ct-message-error').textContent).toMatch(/more detail/i);
    expect(container.querySelector('.ct-sent')).toBeNull();
  });

  it('clears a complaint as soon as the field is fixed', () => {
    const { container } = mount();
    submit(container);
    expect(container.querySelector('#ct-name-error')).toBeInTheDocument();

    fill(container, { name: 'Areeba' });
    expect(container.querySelector('#ct-name-error')).toBeNull();
    expect(field(container, 'name').getAttribute('aria-invalid')).toBeNull();
  });

  it('confirms with a transmission animation instead of an alert', async () => {
    const alert = jest.spyOn(window, 'alert').mockImplementation(() => {});
    const { container } = mount();
    fill(container, { name: 'Areeba Khan', email: 'areeba@example.com', subject: 'Vault order', message: 'I want to ask about the Demon Slayer print run.' });
    submit(container);

    const sent = await waitFor(() => {
      const node = container.querySelector('.ct-sent');
      expect(node).toBeInTheDocument();
      return node;
    });
    expect(sent.getAttribute('role')).toBe('status');
    expect(sent.querySelector('h2').textContent).toBe('TRANSMISSION SENT');
    expect(sent.querySelector('.ct-sent-mark').textContent).toContain('✓');
    expect(sent.textContent).toContain('Areeba');
    expect(alert).not.toHaveBeenCalled();

    // The success state can be cleared for another message.
    fireEvent.click(within(sent).getByRole('button', { name: /send another message/i }));
    expect(container.querySelector('.ct-sent')).toBeNull();
    expect(field(container, 'message').value).toBe('');
    alert.mockRestore();
  });

  it('embeds a map and offers GPS on request', async () => {
    const getCurrentPosition = jest.fn((success) => success({ coords: { latitude: 24.86, longitude: 67.01 } }));
    Object.defineProperty(window.navigator, 'geolocation', { value: { getCurrentPosition }, configurable: true });

    const { container } = mount();
    const map = container.querySelector('.ct-map iframe');
    expect(map.getAttribute('title')).toMatch(/map/i);
    expect(map.getAttribute('src')).toContain('google.com/maps');
    expect(container.querySelector('.ct-directions').getAttribute('href')).toContain('google.com/maps/dir');

    fireEvent.click(container.querySelector('.ct-gps-button'));
    await waitFor(() => expect(container.querySelector('.ct-gps-note').textContent).toMatch(/24\.86/));
    expect(getCurrentPosition).toHaveBeenCalled();
  });

  it('keeps the page usable when location is refused', async () => {
    Object.defineProperty(window.navigator, 'geolocation', {
      value: { getCurrentPosition: (success, failure) => failure(new Error('denied')) },
      configurable: true,
    });

    const { container } = mount();
    fireEvent.click(container.querySelector('.ct-gps-button'));

    await waitFor(() => expect(container.querySelector('.ct-gps-note').textContent).toMatch(/could not read your location/i));
    expect(container.querySelector('.ct-gps-button').textContent).toBe('Use my location');
  });

  it('repaints for the light theme with its own ink', () => {
    const { container } = mount();
    fireEvent.click(within(container.querySelector('.universal-nav')).getByRole('button', { name: /switch to light theme/i }));

    expect(container.querySelector('.ct-page').className).toContain('theme-light');
    expect(window.localStorage.getItem('contact-theme')).toBe('light');
    // The light stage is a deep lavender, not near-white, and it carries a pattern.
    expect(CSS).toMatch(/\.ct-page\.theme-light \{[^}]*--ink: #1a1030/);
    expect(CSS).toMatch(/\.ct-page\.theme-light \{[^}]*--danger: #b3261e/);
    expect(CSS).toMatch(/\.ct-page\.theme-light \{[^}]*#e7dcff/);
    expect(CSS).toMatch(/\.theme-light \.ct-page::after \{[^}]*repeating-linear-gradient/);
    expect(CSS).toMatch(/\.theme-light \.ct-field input,[^{]*\{[^}]*background: rgba\(255, 255, 255/);
    // The heading sits at the top with geometry around it, not a bare band.
    expect(CSS).toMatch(/\.ct-hero-shapes \{[^}]*position: absolute/);
    expect(CSS).toMatch(/\.ct-shape\.is-ring \{/);
    expect(CSS).toMatch(/\.ct-shape\.is-shard \{/);
    expect(container.querySelectorAll('.ct-shape').length).toBeGreaterThanOrEqual(5);
    expect(container.querySelector('.ct-shape.is-dot')).toBeInTheDocument();
    expect(container.querySelector('.ct-lede').textContent.length).toBeGreaterThan(40);
    // The footer no longer floats above an empty band at the bottom.
    expect(CSS).toMatch(/\.ct-page \{[^}]*padding-bottom: 80px/);
    expect(CSS).toContain('@media (prefers-reduced-motion: reduce)');
  });
});
