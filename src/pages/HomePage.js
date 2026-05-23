import { useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import characters from '../data/characters.json';
import locations from '../data/locations.json';
import words from '../data/words.json';

const SEARCH_EXAMPLES = ['Moses', 'Bethlehem', 'Paul', 'שָׁלוֹם', 'Mary', 'Babylon'];

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
  const searchRef = useRef(null);

  const featuredCharacter = useMemo(() => {
    const dayIndex = Math.floor(Date.now() / 86400000);
    return characters[dayIndex % characters.length];
  }, []);

  const scrollToSearch = () => {
    if (!searchRef.current) return;
    searchRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const input = searchRef.current.querySelector('input');
    if (input) {
      setTimeout(() => input.focus({ preventScroll: true }), 400);
    }
  };

  const surpriseMe = () => {
    const choice = Math.floor(Math.random() * 3);
    if (choice === 0) {
      const c = characters[Math.floor(Math.random() * characters.length)];
      navigate(`/characters/${c.id}`);
    } else if (choice === 1) {
      const w = words[Math.floor(Math.random() * words.length)];
      navigate(`/words?open=${w.id}`);
    } else {
      const l = locations[Math.floor(Math.random() * locations.length)];
      navigate(`/map?location=${l.id}`);
    }
  };

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
      <Helmet>
        <title>Selah — Explore the Biblical World</title>
        <meta name="description" content="An interactive atlas of the biblical world. Explore maps, characters, timelines, and original Hebrew and Greek words." />
        <meta property="og:title" content="Selah — Explore the Biblical World" />
        <meta property="og:description" content="An interactive atlas of the biblical world. Explore maps, characters, timelines, and original Hebrew and Greek words." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Selah — Explore the Biblical World" />
        <meta name="twitter:description" content="An interactive atlas of the biblical world. Explore maps, characters, timelines, and original Hebrew and Greek words." />
      </Helmet>
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

          <div className="global-search" ref={searchRef}>
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

            {!query && (
              <div className="search-examples" aria-label="Search suggestions">
                <span className="search-examples__label">Try:</span>
                {SEARCH_EXAMPLES.map((ex) => (
                  <button
                    key={ex}
                    type="button"
                    className="search-examples__chip"
                    onClick={() => setQuery(ex)}
                  >
                    {ex}
                  </button>
                ))}
              </div>
            )}

            <button
              type="button"
              className="surprise-btn"
              onClick={surpriseMe}
            >
              Surprise Me
              <span aria-hidden="true">→</span>
            </button>

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

      <section className="about" aria-labelledby="about-heading">
        <div className="about__inner">
          <span className="about__eyebrow">About</span>
          <h2 className="about__title" id="about-heading">What is Selah?</h2>
          <div className="about__paragraphs">
            <p>
              Selah is an interactive atlas of the biblical world. It maps the
              geography that the prophets walked, traces the lives behind the
              names, and surfaces the Hebrew and Greek words behind the English
              text — all in one place, all linked together.
            </p>
            <p>
              It is built for the curious. Students, teachers, the merely
              interested — anyone who has read a verse and wished they could see
              where it happened, who else was in the room, or what the original
              word actually meant. Nothing here assumes you already know the
              answers.
            </p>
            <p>
              Most Bible apps are reading tools. Selah is an exploring tool. You
              can wander from a person to the places they touched, from a word
              to the verses where it appears, from a moment on the timeline to
              the web of people around it. It is scripture as a world, not just
              as a text.
            </p>
          </div>
          <button
            type="button"
            className="about__cta"
            onClick={scrollToSearch}
          >
            Start Exploring
            <span aria-hidden="true">↑</span>
          </button>
        </div>
      </section>

      <section className="featured" aria-labelledby="featured-heading">
        <div className="featured__inner">
          <span className="featured__eyebrow">Featured Character of the Day</span>
          <h2 className="featured__name" id="featured-heading">
            {featuredCharacter.name}
          </h2>
          <p className="featured__period">{featuredCharacter.period}</p>
          <p className="featured__desc">{featuredCharacter.description}</p>
          <Link
            to={`/characters/${featuredCharacter.id}`}
            className="featured__cta"
          >
            View Profile
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </>
  );
}

export default HomePage;
