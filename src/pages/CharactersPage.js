import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import characters from '../data/characters.json';
import { useBookmarks } from '../hooks/useBookmarks';

const ERAS = [
  { id: 'antediluvian', label: 'Antediluvian',     keywords: ['antediluvian'] },
  { id: 'patriarchs',   label: 'Patriarchs',        keywords: ['patriarchal', 'sojourn'] },
  { id: 'exodus',       label: 'Exodus',             keywords: ['exodus', 'wilderness', 'conquest'] },
  { id: 'judges',       label: 'Judges',             keywords: ['judges', '12th century'] },
  { id: 'kings',        label: 'Kings & Prophets',   keywords: ['monarchy', 'century bc'] },
  { id: 'restoration',  label: 'Exile & Return',     keywords: ['5th century', '6th century', 'late 6th', 'early 6th'] },
  { id: 'nt',           label: 'New Testament',      keywords: ['new testament', '1st century ad'] },
];

const YEAR_RANGES = {
  antediluvian: [-Infinity, -2500],
  patriarchs:   [-2500,     -1500],
  exodus:       [-1500,     -1200],
  judges:       [-1200,     -1000],
  kings:        [-1000,      -539],
  restoration:  [ -539,        -4],
  nt:           [   -4,      Infinity],
};

function classifyEra(c) {
  const p = (c.period || '').toLowerCase();
  for (const era of ERAS) {
    if (era.keywords.some((k) => p.includes(k))) return era.id;
  }
  if (typeof c.birthYear === 'number') {
    for (const [id, [min, max]] of Object.entries(YEAR_RANGES)) {
      if (c.birthYear >= min && c.birthYear < max) return id;
    }
  }
  return null;
}

function CharactersPage() {
  const [query, setQuery]       = useState('');
  const [era, setEra]           = useState(null);
  const [showSaved, setShowSaved] = useState(false);
  const searchRef               = useRef(null);
  const { bookmarks, isBookmarked, toggle } = useBookmarks();

  const displayed = useMemo(() => {
    const q = query.trim().toLowerCase();
    return characters.filter((c) => {
      if (showSaved && !isBookmarked(c.id)) return false;
      if (era && classifyEra(c) !== era) return false;
      if (q) {
        return [c.name, c.fullName, c.description, c.period, c.birthplace]
          .filter(Boolean)
          .some((s) => s.toLowerCase().includes(q));
      }
      return true;
    });
  }, [query, era, showSaved, isBookmarked]);

  const clearAll = () => {
    setQuery('');
    setEra(null);
    setShowSaved(false);
  };

  const hasFilters = query || era || showSaved;

  return (
    <section className="page">
      <Helmet>
        <title>Characters — Selah</title>
        <meta name="description" content="Browse biblical figures — prophets, kings, and unnamed witnesses — with biographies, scripture references, and relationship maps." />
        <meta property="og:title" content="Characters — Selah" />
        <meta property="og:description" content="Browse biblical figures — prophets, kings, and unnamed witnesses — with biographies, scripture references, and relationship maps." />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Characters — Selah" />
        <meta name="twitter:description" content="Browse biblical figures — prophets, kings, and unnamed witnesses — with biographies, scripture references, and relationship maps." />
      </Helmet>
      <div className="page__inner">
        <header className="page__header">
          <span className="page__eyebrow">Lives</span>
          <h1 className="page__title">Characters</h1>
          <p className="page__lede">
            The prophets, kings, and unnamed witnesses whose stories shape the
            biblical world.
          </p>
        </header>

        {/* Search */}
        <div className="char-search" ref={searchRef}>
          <span className="char-search__icon" aria-hidden="true">⌕</span>
          <input
            type="search"
            className="char-search__input"
            placeholder="Search by name, period, or description…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search characters"
          />
          {query && (
            <button
              type="button"
              className="char-search__clear"
              onClick={() => setQuery('')}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        {/* Era filters + Saved */}
        <div className="char-filters">
          <div className="char-era-chips">
            {ERAS.map((e) => (
              <button
                key={e.id}
                type="button"
                className={`char-era-chip${era === e.id ? ' char-era-chip--active' : ''}`}
                onClick={() => setEra((prev) => (prev === e.id ? null : e.id))}
                aria-pressed={era === e.id}
              >
                {e.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            className={`characters-filter-btn${showSaved ? ' characters-filter-btn--active' : ''}`}
            onClick={() => setShowSaved((v) => !v)}
            aria-pressed={showSaved}
          >
            <span aria-hidden="true">{showSaved ? '★' : '☆'}</span>
            Saved
            {bookmarks.size > 0 && (
              <span className="characters-filter-btn__count">{bookmarks.size}</span>
            )}
          </button>
        </div>

        {/* Result count */}
        <div className="char-meta">
          <span className="char-count">
            {displayed.length} {displayed.length === 1 ? 'character' : 'characters'}
            {hasFilters && ` of ${characters.length}`}
          </span>
          {hasFilters && (
            <button type="button" className="char-clear-btn" onClick={clearAll}>
              Clear filters
            </button>
          )}
        </div>

        {/* Grid */}
        {displayed.length === 0 ? (
          <p className="characters-empty">
            {showSaved && !query && !era
              ? <>No saved characters yet. Open a profile and tap <strong>Save</strong> to bookmark it here.</>
              : <>No characters match. <button type="button" className="char-clear-btn" onClick={clearAll}>Clear filters</button></>
            }
          </p>
        ) : (
          <div className="character-grid">
            {displayed.map((c) => (
              <article key={c.id} className="character-card">
                <div className="character-card__body">
                  <h2 className="character-card__name">{c.name}</h2>
                  <span className="character-card__period">{c.period}</span>
                  <p className="character-card__description">{c.description}</p>
                </div>
                <div className="character-card__footer">
                  <Link to={`/characters/${c.id}`} className="character-card__cta">
                    View Profile
                    <span aria-hidden="true">→</span>
                  </Link>
                  <button
                    type="button"
                    className={`character-card__bookmark${isBookmarked(c.id) ? ' character-card__bookmark--saved' : ''}`}
                    onClick={() => toggle(c.id)}
                    aria-label={isBookmarked(c.id) ? 'Remove bookmark' : 'Save character'}
                  >
                    {isBookmarked(c.id) ? '★' : '☆'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default CharactersPage;
