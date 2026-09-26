import { useEffect, useState } from 'react';
import { EMAIL, Field, GlitchFandoms } from './authShared';
import './auth.css';

const THEME_KEY = 'signup-theme';

function Signup() {
  const [theme, setTheme] = useState(() => (typeof window !== 'undefined' && window.localStorage.getItem(THEME_KEY)) || 'dark');
  const [values, setValues] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(false);

  useEffect(() => {
    try { window.localStorage.setItem(THEME_KEY, theme); } catch (error) { /* storage is optional */ }
  }, [theme]);

  const update = (name) => (event) => {
    setValues((current) => ({ ...current, [name]: event.target.value }));
    setErrors((current) => (current[name] ? { ...current, [name]: undefined } : current));
  };

  // Demo sign-up. The fields are checked properly, but no account is created
  // and nothing is written to storage.
  const onSubmit = (event) => {
    event.preventDefault();
    const found = {};
    if (!values.name.trim()) found.name = 'Tell us what to call you.';
    else if (values.name.trim().length < 2) found.name = 'That name looks too short.';
    if (!values.email.trim()) found.email = 'We need an email for your account.';
    else if (!EMAIL.test(values.email.trim())) found.email = 'That email address does not look right.';
    if (!values.password) found.password = 'Choose a password.';
    else if (values.password.length < 8) found.password = 'Use at least 8 characters.';
    if (!values.confirm) found.confirm = 'Type the password once more.';
    else if (values.confirm !== values.password) found.confirm = 'Those two passwords do not match.';
    setErrors(found);
    if (Object.keys(found).length) return;
    setDone(true);
  };

  return (
    <div className={`au-page au-page-strip theme-${theme}`}>
      <div className="au-glow au-glow-one" aria-hidden="true" />
      <div className="au-glow au-glow-two" aria-hidden="true" />

      {/* The sign-up screen is the form on its own. No nav, no footer and no art
          panel; the seven fandom images drift past as a glitch band instead. */}
      <div className="au-strip">
        <GlitchFandoms />

        <div className="au-theme-toggle">
          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
        </div>

        <section className="au-panel" aria-label="Create an account">
          {done ? (
            <div className="au-done" role="status">
              <span className="au-done-mark" aria-hidden="true">&#10003;</span>
              <h1>WELCOME TO THE VERSE, {values.name.trim().split(' ')[0].toUpperCase()}!</h1>
              <p>Your account is ready in this demo. Nothing was stored, so nothing to leak.</p>
              <a className="au-cta" href="#home">Start exploring</a>
            </div>
          ) : (
            <>
              <p className="au-kicker">Join</p>
              <h1 className="au-title">CREATE YOUR <em>ACCOUNT</em></h1>
              <p className="au-sub">One account for every fandom, your bookmarks and your notes.</p>

              <form className="au-form" onSubmit={onSubmit} noValidate>
                <Field
                  id="au-name"
                  label="Name"
                  type="text"
                  autoComplete="name"
                  placeholder="Areeba"
                  value={values.name}
                  error={errors.name}
                  onChange={update('name')}
                />
                <Field
                  id="au-email"
                  label="Email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={values.email}
                  error={errors.email}
                  onChange={update('email')}
                />
                <Field
                  id="au-password"
                  label="Password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  value={values.password}
                  error={errors.password}
                  onChange={update('password')}
                />
                <Field
                  id="au-confirm"
                  label="Confirm password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Type it once more"
                  value={values.confirm}
                  error={errors.confirm}
                  onChange={update('confirm')}
                />

                <button type="submit" className="au-cta">Create account</button>
              </form>

              <p className="au-switch">
                Already a member? <a href="#sign-in">Sign in</a>
              </p>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

export default Signup;
