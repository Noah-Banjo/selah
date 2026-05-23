import { Fragment, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import characters from '../data/characters.json';
import { findLocationByLabel } from '../data/locationLookup';
import { categorize } from '../data/relationshipCategories';
import { useBookmarks } from '../hooks/useBookmarks';
import { useNote } from '../hooks/useNotes';

const charactersById = characters.reduce((acc, c) => {
  acc[c.id] = c;
  return acc;
}, {});

const encodeBibleRef = (ref) =>
  ref
    .replace(/\([^)]*\)/g, '')
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\s+/g, '+');

function CharacterProfilePage() {
  const { id } = useParams();
  const character = characters.find((c) => c.id === id);
  const [toast, setToast] = useState(null);
  const { toggle, isBookmarked } = useBookmarks();
  const bookmarked = character ? isBookmarked(character.id) : false;
  const { text: note, update: updateNote } = useNote(id);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setToast('Link copied!');
    } catch (e) {
      setToast('Could not copy');
    }
    setTimeout(() => setToast(null), 2200);
  };

  const relationships = useMemo(() => {
    if (!character?.relationships) return [];
    return character.relationships
      .map((r) => ({
        ...r,
        other: charactersById[r.characterId],
        category: categorize(r.type),
      }))
      .filter((r) => r.other);
  }, [character]);

  if (!character) {
    return (
      <section className="page">
        <div className="page__inner">
          <header className="page__header">
            <h1 className="page__title">Not found</h1>
            <p className="page__lede">No character matches that name.</p>
          </header>
          <Link to="/characters" className="back-link">
            ← All Characters
          </Link>
        </div>
      </section>
    );
  }

  const metaTitle = `${character.name} — Selah`;
  const metaDesc = character.description;

  return (
    <section className="page">
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDesc} />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDesc} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDesc} />
      </Helmet>
      <div className="page__inner profile">
        <Link to="/characters" className="back-link">
          ← All Characters
        </Link>

        <header className="profile__header">
          <span className="profile__eyebrow">{character.period}</span>
          <h1 className="profile__name">{character.fullName}</h1>
          <p className="profile__description">{character.description}</p>
          <div className="profile__actions">
            {relationships.length > 0 && (
              <Link
                to={`/relationships?focus=${character.id}`}
                className="profile__graph-button"
              >
                View in Graph
                <span aria-hidden="true">→</span>
              </Link>
            )}
            <button
              type="button"
              className={`bookmark-button${bookmarked ? ' bookmark-button--saved' : ''}`}
              onClick={() => toggle(character.id)}
              aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark this character'}
            >
              <span className="bookmark-button__icon" aria-hidden="true">
                {bookmarked ? '★' : '☆'}
              </span>
              {bookmarked ? 'Saved' : 'Save'}
            </button>
            <button
              type="button"
              className="share-button"
              onClick={handleShare}
              aria-label="Copy link to this profile"
            >
              <span className="share-button__icon" aria-hidden="true">⤴</span>
              Share
            </button>
          </div>
        </header>

        <div className="profile__meta">
          <div className="profile__meta-item">
            <span className="profile__meta-label">Birthplace</span>
            <span className="profile__meta-value">{character.birthplace}</span>
          </div>
          <div className="profile__meta-item">
            <span className="profile__meta-label">Time period</span>
            <span className="profile__meta-value">{character.period}</span>
          </div>
        </div>

        <div className="profile__section">
          <h2 className="profile__section-title">Key Locations</h2>
          <ul className="chip-list">
            {character.locations.map((place) => {
              const loc = findLocationByLabel(place);
              if (loc) {
                return (
                  <li key={place}>
                    <Link
                      to={`/map?location=${loc.id}`}
                      className="chip chip--link"
                      title={`View ${loc.name} on the map`}
                    >
                      {place}
                      <span className="chip__arrow" aria-hidden="true">→</span>
                    </Link>
                  </li>
                );
              }
              return (
                <li key={place} className="chip">
                  {place}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="profile__section">
          <h2 className="profile__section-title">Biography</h2>
          <div className="profile__bio">
            {character.biography.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </div>

        <div className="profile__section">
          <h2 className="profile__section-title">Scripture</h2>
          <ul className="reference-list">
            {character.references.map((r) => {
              const parts = r.ref.split(';').map((s) => s.trim()).filter(Boolean);
              return (
                <li key={r.ref} className="reference">
                  <span className="reference__ref">
                    {parts.map((part, i) => (
                      <Fragment key={part}>
                        <Link
                          to={`/bible?ref=${encodeBibleRef(part)}`}
                          className="reference__link"
                          title={`Read ${part}`}
                        >
                          {part}
                        </Link>
                        {i < parts.length - 1 && (
                          <span className="reference__sep">;{' '}</span>
                        )}
                      </Fragment>
                    ))}
                  </span>
                  <span className="reference__note">{r.note}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {toast && (
          <div className="toast" role="status" aria-live="polite">
            {toast}
          </div>
        )}

        {relationships.length > 0 && (
          <div className="profile__section">
            <h2 className="profile__section-title">Relationships</h2>
            <div className="relationship-grid">
              {relationships.map((r) => (
                <Link
                  key={r.characterId}
                  to={`/characters/${r.other.id}`}
                  className={`relationship-card relationship-card--${r.category}`}
                >
                  <span className={`relationship-card__type relationship-card__type--${r.category}`}>
                    {r.type}
                  </span>
                  <span className="relationship-card__name">{r.other.name}</span>
                  <span className="relationship-card__desc">{r.description}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="profile__section profile__notes-section">
          <h2 className="profile__section-title">My Notes</h2>
          <textarea
            className="profile__notes"
            placeholder={`Your personal notes on ${character.name}…`}
            value={note}
            onChange={(e) => updateNote(e.target.value)}
            aria-label={`Personal notes about ${character.name}`}
            rows={5}
          />
          {note && (
            <button
              type="button"
              className="profile__notes-clear"
              onClick={() => updateNote('')}
            >
              Clear notes
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

export default CharacterProfilePage;
