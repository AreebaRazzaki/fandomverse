import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import './ArticleModal.css';

function ArticleModal({ article, related, onClose, onSelect, style }) {
  const closeRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!article) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    if (closeRef.current) closeRef.current.focus();
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [article, onClose]);

  if (!article) return null;

  const published = new Date(`${article.date}T00:00:00`).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return createPortal(
    <div className="reader-overlay" style={style} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="reader" role="dialog" aria-modal="true" aria-labelledby="reader-title" ref={panelRef}>
        <button type="button" className="reader-close" onClick={onClose} ref={closeRef} aria-label="Close article">&times;</button>

        <div className="reader-hero">
          <img src={article.image} alt={article.imageAlt} />
          <span className="reader-hero-shade" aria-hidden="true" />
        </div>

        <div className="reader-body">
          <p className="reader-kicker"><span /> {article.category} / {article.kicker}</p>
          <h2 id="reader-title">{article.title}</h2>
          <p className="reader-meta">
            <span>By {article.author}</span>
            <i aria-hidden="true" />
            <span>{published}</span>
            <i aria-hidden="true" />
            <span>{article.readTime} read</span>
          </p>
          <p className="reader-standfirst">{article.excerpt}</p>

          <div className="reader-copy">
            {article.body.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          {article.pullQuote && <blockquote>{article.pullQuote}</blockquote>}

          <ul className="reader-tags">
            {article.tags.map((tag) => <li key={tag}>{tag}</li>)}
          </ul>

          {related.length > 0 && (
            <div className="reader-related">
              <p className="reader-related-kicker">Keep reading</p>
              <div className="reader-related-grid">
                {related.map((item) => (
                  <button type="button" key={item.slug} onClick={() => onSelect(item)}>
                    <b>{item.title}</b>
                    <small>{item.category} &middot; {item.readTime}</small>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default ArticleModal;
