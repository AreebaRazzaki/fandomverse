// Pieces shared by the sign-in and sign-up screens. Neither page posts
// anywhere: both validate on the client and then show a local success state.
export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function Field({ id, label, type, value, onChange, error, autoComplete, placeholder }) {
  const errorId = `${id}-error`;
  return (
    <div className="au-field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? errorId : undefined}
        onChange={onChange}
      />
      {error && <p className="au-error" id={errorId}>{error}</p>}
    </div>
  );
}

export function AuthArt({ caption, points }) {
  return (
    <div className="au-art" aria-hidden="true">
      <span className="au-art-glow" />
      <img src="/assets/images/anime1.png" alt="" />
      <img className="au-art-second" src="/assets/images/game1.png" alt="" />
      <div className="au-art-copy">
        <b>{caption}</b>
        <ul>
          {points.map((point) => <li key={point}>{point}</li>)}
        </ul>
      </div>
    </div>
  );
}

// The seven fandom images from the home page, used as a glitching background
// band on the auth screens.
export const FANDOM_ART = [
  '/assets/images/anime.png',
  '/assets/images/gaming.png',
  '/assets/images/movie.png',
  '/assets/images/tv shows.png',
  '/assets/images/k-pop.png',
  '/assets/images/comics.png',
  '/assets/images/manga.png',
];

export function GlitchFandoms() {
  return (
    <div className="au-glitch" aria-hidden="true">
      <div className="au-glitch-strip">
        {FANDOM_ART.map((src, index) => (
          <img
            key={src}
            src={src}
            alt=""
            loading="lazy"
            style={{ '--glitch-delay': `${index * 0.42}s` }}
          />
        ))}
      </div>
      <div className="au-glitch-strip is-dupe" aria-hidden="true">
        {FANDOM_ART.map((src, index) => (
          <img
            key={`${src}-dupe`}
            src={src}
            alt=""
            loading="lazy"
            style={{ '--glitch-delay': `${index * 0.42 + 0.2}s` }}
          />
        ))}
      </div>
    </div>
  );
}
