import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import characters from '../data/characters.json';
import { useBookmarks } from '../hooks/useBookmarks';

function CharactersPage() {
  const [showSaved, setShowSaved] = useState(false);
  const { bookmarks, isBookmarked, toggle } = useBookmarks();

  const displayed = showSaved
    ? characters.filter((c) => isBookmarked(c.id))
    : characters;

  return (
    <section className="page">
      <Helmet>
        <title>Characters — Selah</title>
        <meta name="description" content="Browse 100 biblical figures — prophets, kings, and unnamed witnesses — with biographies, scripture references, and relationship maps." />
        <meta property="og:title" content="Characters — Selah" />
        <meta property="og:description" content="Browse 100 biblical figures — prophets, kings, and unnamed witnesses — with biographies, scripture references, and relationship maps." />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Characters — Selah" />
        <meta name="twitter:description" content="Browse 100 biblical figures — prophets, kings, and unnamed witnesses — with biographies, scripture references, and relationship maps." />
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

        <div className="characters-toolbar">
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

        {showSaved && displayed.length === 0 ? (
          <p className="characters-empty">
            No saved characters yet. Open a profile and tap <strong>Save</strong> to bookmark it here.
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
