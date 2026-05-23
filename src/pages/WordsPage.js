import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import words from '../data/words.json';

function WordsPage() {
  const [searchParams] = useSearchParams();
  const openId = searchParams.get('open');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(openId || null);
  const [toast, setToast] = useState(null);
  const cardRefs = useRef({});

  const handleShare = async (wordId) => {
    const url = `${window.location.origin}${window.location.pathname}?open=${wordId}`;
    try {
      await navigator.clipboard.writeText(url);
      setToast('Link copied!');
    } catch (e) {
      setToast('Could not copy');
    }
    setTimeout(() => setToast(null), 2200);
  };

  useEffect(() => {
    if (!openId) return;
    setExpandedId(openId);
    const el = cardRefs.current[openId];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [openId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return words;
    return words.filter(
      (w) =>
        w.word.toLowerCase().includes(q) ||
        w.transliteration.toLowerCase().includes(q) ||
        w.translation.toLowerCase().includes(q)
    );
  }, [search]);

  const toggle = (id) => setExpandedId((current) => (current === id ? null : id));

  return (
    <section className="page">
      <Helmet>
        <title>Words — Selah</title>
        <meta name="description" content="Explore the original Hebrew and Greek words behind scripture — transliterations, definitions, and the verses where they appear." />
        <meta property="og:title" content="Words — Selah" />
        <meta property="og:description" content="Explore the original Hebrew and Greek words behind scripture — transliterations, definitions, and the verses where they appear." />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Words — Selah" />
        <meta name="twitter:description" content="Explore the original Hebrew and Greek words behind scripture — transliterations, definitions, and the verses where they appear." />
      </Helmet>
      <div className="page__inner">
        <header className="page__header">
          <span className="page__eyebrow">Language</span>
          <h1 className="page__title">Words</h1>
          <p className="page__lede">
            The Hebrew, Greek, and Aramaic terms behind the English text — the
            texture of the language scripture was first spoken in.
          </p>
        </header>

        <div className="word-search">
          <span className="word-search__icon" aria-hidden="true">⌕</span>
          <input
            type="search"
            className="word-search__input"
            placeholder="Search by word, transliteration, or meaning"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search words"
          />
          {search && (
            <button
              type="button"
              className="word-search__clear"
              onClick={() => setSearch('')}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <p className="word-empty">No words match "{search}".</p>
        ) : (
          <div className="words-grid">
            {filtered.map((w) => {
              const isOpen = expandedId === w.id;
              return (
                <article
                  key={w.id}
                  ref={(el) => {
                    if (el) cardRefs.current[w.id] = el;
                  }}
                  className={`word-card${isOpen ? ' word-card--open' : ''}`}
                >
                  <button
                    type="button"
                    className="word-card__toggle"
                    onClick={() => toggle(w.id)}
                    aria-expanded={isOpen}
                  >
                    <div className="word-card__head">
                      <span className="word-card__script" lang={w.language === 'Greek' ? 'grc' : 'he'}>
                        {w.word}
                      </span>
                      <span className="word-card__lang">{w.language}</span>
                    </div>
                    <div className="word-card__transliteration">
                      {w.transliteration}
                    </div>
                    <div className="word-card__translation">
                      &ldquo;{w.translation}&rdquo;
                    </div>
                    <p className="word-card__context">{w.context}</p>
                    <span className="word-card__more">
                      {isOpen ? 'Hide' : 'Read more'}
                      <span className="word-card__chevron" aria-hidden="true">
                        {isOpen ? '−' : '+'}
                      </span>
                    </span>
                  </button>

                  {isOpen && (
                    <div className="word-card__expanded">
                      <div className="word-card__section">
                        <h3 className="word-card__section-title">Definition</h3>
                        <p>{w.definition}</p>
                      </div>
                      <div className="word-card__section">
                        <h3 className="word-card__section-title">
                          Where it appears
                        </h3>
                        <ul className="word-card__verses">
                          {w.verses.map((v) => (
                            <li key={v}>{v}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="word-card__section">
                        <h3 className="word-card__section-title">
                          Why it matters
                        </h3>
                        <p>{w.significance}</p>
                      </div>
                      <div className="word-card__share-row">
                        <button
                          type="button"
                          className="share-button"
                          onClick={() => handleShare(w.id)}
                          aria-label={`Copy link to ${w.transliteration}`}
                        >
                          <span className="share-button__icon" aria-hidden="true">⤴</span>
                          Share
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}

        {toast && (
          <div className="toast" role="status" aria-live="polite">
            {toast}
          </div>
        )}
      </div>
    </section>
  );
}

export default WordsPage;
