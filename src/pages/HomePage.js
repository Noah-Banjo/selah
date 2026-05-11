import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import characters from '../data/characters.json';
import locations from '../data/locations.json';
import words from '../data/words.json';

const SECTIONS = [
  {
    id: 'map',
    eyebrow: 'Atlas',
    title: 'Map',
    description:
      'Trace journeys, kingdoms, and cities across the ancient Near East — from Eden to Patmos.',
    to: '/map',
  },
  {
    id: 'characters',
    eyebrow: 'Lives',
    title: 'Characters',
    description:
      'Meet the prophets, kings, and unnamed witnesses whose stories shaped the biblical world.',
    to: '/characters',
  },
  {
    id: 'words',
    eyebrow: 'Language',
    title: 'Words',
    description:
      'Explore the original Hebrew and Greek — the texture of the language behind the text.',
    to: '/words',
  },
  {
    id: 'timeline',
    eyebrow: 'Chronology',
    title: 'Timeline',
    description:
      'Two thousand years on one horizon — from Abraham to the apostles, plotted in gold.',
    to: '/timeline',
  },
];

const MAX_PER_GROUP = 4;

function HomePage() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;

    const matchedCharacters = characters
      .filter((c) =>
        [c.name, c.fullName, c.description, c.period, c.birthplace]
          .filter(Boolean)
          .some((s) => s.toLowerCase().includes(q))
      )
      .slice(0, MAX_PER_GROUP);

    const matchedLocations = locations
      .filter((l) =>
        [l.name, l.modernCountry, l.significance, ...(l.characters || [])]
          .filter(Boolean)
          .some((s) => s.toLowerCase().includes(q))
      )
      .slice(0, MAX_PER_GROUP);

    const matchedWords = words
      .filter((w) =>
        [w.word, w.transliteration, w.translation, w.context, w.language]
          .filter(Boolean)
          .some((s) => s.toLowerCase().includes(q))
      )
      .slice(0, MAX_PER_GROUP);

    return {
      characters: matchedCharacters,
      locations: matchedLocations,
      words: matchedWords,
      total:
        matchedCharacters.length +
        matchedLocations.length +
        matchedWords.length,
    };
  }, [query]);

  const goTo = (path) => {
    setQuery('');
    navigate(path);
  };

  return (
    <>
      <section className="hero">
        <div className="hero__inner">
          <span className="hero__eyebrow">An interactive biblical world explorer</span>
          <h1 className="hero__title">Selah</h1>
          <p className="hero__tagline">Explore the Biblical World</p>
          <div className="hero__divider" aria-hidden="true" />
          <p className="hero__lede">
            A quiet pause between verses — a place to wander the geography,
            the people, and the language of scripture.
          </p>

          <div className="global-search">
            <div className="global-search__field">
              <span className="global-search__icon" aria-hidden="true">⌕</span>
              <input
                type="search"
                className="global-search__input"
                placeholder="Search people, places, or words…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search Selah"
              />
              {query && (
                <button
                  type="button"
                  className="global-search__clear"
                  onClick={() => setQuery('')}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>

            {results && (
              <div className="global-search__results" role="listbox">
                {results.total === 0 ? (
                  <p className="global-search__empty">
                    Nothing matches &ldquo;{query}&rdquo;.
                  </p>
                ) : (
                  <>
                    {results.characters.length > 0 && (
                      <div className="global-search__group">
                        <h3 className="global-search__group-title">Characters</h3>
                        <ul className="global-search__list">
                          {results.characters.map((c) => (
                            <li key={c.id}>
                              <button
                                type="button"
                                className="global-search__item"
                                onClick={() => goTo(`/characters/${c.id}`)}
                              >
                                <span className="global-search__primary">
                                  {c.name}
                                </span>
                                <span className="global-search__secondary">
                                  {c.period}
                                </span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {results.locations.length > 0 && (
                      <div className="global-search__group">
                        <h3 className="global-search__group-title">Locations</h3>
                        <ul className="global-search__list">
                          {results.locations.map((l) => (
                            <li key={l.id}>
                              <button
                                type="button"
                                className="global-search__item"
                                onClick={() => goTo(`/map?location=${l.id}`)}
                              >
                                <span className="global-search__primary">
                                  {l.name}
                                </span>
                                <span className="global-search__secondary">
                                  {l.modernCountry}
                                </span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {results.words.length > 0 && (
                      <div className="global-search__group">
                        <h3 className="global-search__group-title">Words</h3>
                        <ul className="global-search__list">
                          {results.words.map((w) => (
                            <li key={w.id}>
                              <button
                                type="button"
                                className="global-search__item"
                                onClick={() => goTo(`/words?open=${w.id}`)}
                              >
                                <span className="global-search__primary">
                                  {w.transliteration}
                                  <span className="global-search__script">
                                    {w.word}
                                  </span>
                                </span>
                                <span className="global-search__secondary">
                                  {w.language} · {w.translation}
                                </span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="cards" aria-label="Browse">
        <div className="cards__grid">
          {SECTIONS.map((section) => {
            const content = (
              <>
                <span className="card__eyebrow">{section.eyebrow}</span>
                <h2 className="card__title">{section.title}</h2>
                <p className="card__description">{section.description}</p>
                <span className="card__cta" aria-hidden="true">
                  Enter <span className="card__arrow">→</span>
                </span>
              </>
            );

            return section.to ? (
              <Link key={section.id} className="card" to={section.to}>
                {content}
              </Link>
            ) : (
              <a key={section.id} className="card" href={section.href}>
                {content}
              </a>
            );
          })}
        </div>
      </section>
    </>
  );
}

export default HomePage;
