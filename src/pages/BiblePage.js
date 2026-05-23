import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const DAILY_REF = 'John 3:16';

function normalizeReference(ref) {
  return ref
    .replace(/\([^)]*\)/g, '')
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

function encodeRef(ref) {
  return normalizeReference(ref).replace(/\s+/g, '+');
}

async function fetchPassage(reference) {
  const slug = encodeRef(reference);
  if (!slug) throw new Error('Please enter a reference.');
  const res = await fetch(`https://bible-api.com/${slug}`);
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(
        "We couldn't find that reference. Try something like \"John 3:16\" or \"Psalm 23\"."
      );
    }
    throw new Error(
      `The Bible service is unreachable right now (HTTP ${res.status}). Try again in a moment.`
    );
  }
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}

function PassageDisplay({ passage, variant }) {
  if (!passage) return null;
  return (
    <article className={`bible-passage${variant ? ` bible-passage--${variant}` : ''}`}>
      <h3 className="bible-passage__ref">{passage.reference}</h3>
      <div className="bible-passage__verses">
        {passage.verses.map((v, i) => (
          <p
            key={`${v.chapter}-${v.verse}-${i}`}
            className="bible-passage__verse"
          >
            <sup className="bible-passage__num">{v.verse}</sup>
            {v.text.trim()}
          </p>
        ))}
      </div>
      {passage.translation_name && (
        <p className="bible-passage__source">{passage.translation_name}</p>
      )}
    </article>
  );
}

function BiblePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryRef = searchParams.get('ref');

  const [daily, setDaily] = useState(null);
  const [dailyLoading, setDailyLoading] = useState(true);
  const [dailyError, setDailyError] = useState(null);

  const [input, setInput] = useState(queryRef ?? '');
  const [result, setResult] = useState(null);
  const [resultLoading, setResultLoading] = useState(false);
  const [resultError, setResultError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchPassage(DAILY_REF)
      .then((data) => {
        if (!cancelled) setDaily(data);
      })
      .catch((e) => {
        if (!cancelled) setDailyError(e.message);
      })
      .finally(() => {
        if (!cancelled) setDailyLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!queryRef) {
      setResult(null);
      setResultError(null);
      return;
    }
    let cancelled = false;
    setInput(queryRef);
    setResult(null);
    setResultLoading(true);
    setResultError(null);
    fetchPassage(queryRef)
      .then((data) => {
        if (!cancelled) setResult(data);
      })
      .catch((e) => {
        if (!cancelled) setResultError(e.message);
      })
      .finally(() => {
        if (!cancelled) setResultLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [queryRef]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    if (trimmed === queryRef) return;
    setSearchParams({ ref: trimmed }, { replace: true });
  };

  const clearResult = () => {
    setInput('');
    setSearchParams({}, { replace: true });
  };

  return (
    <section className="page bible-page">
      <Helmet>
        <title>Bible — Selah</title>
        <meta name="description" content="Read scripture passages linked to the people, places, and words across the biblical world." />
        <meta property="og:title" content="Bible — Selah" />
        <meta property="og:description" content="Read scripture passages linked to the people, places, and words across the biblical world." />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Bible — Selah" />
        <meta name="twitter:description" content="Read scripture passages linked to the people, places, and words across the biblical world." />
      </Helmet>
      <div className="page__inner">
        <header className="page__header">
          <span className="page__eyebrow">Scripture</span>
          <h1 className="page__title">Bible</h1>
          <p className="page__lede">
            Read any passage of scripture. Type a reference like &ldquo;John
            3:16&rdquo; or &ldquo;Psalm 23&rdquo; and the text appears below.
          </p>
        </header>

        <section className="bible-section bible-section--daily" aria-labelledby="daily-heading">
          <header className="bible-section__head">
            <span className="bible-section__eyebrow">Featured</span>
            <h2 className="bible-section__title" id="daily-heading">
              Verse of the Day
            </h2>
          </header>
          {dailyLoading && <p className="bible-state bible-state--loading">Loading verse&hellip;</p>}
          {dailyError && (
            <p className="bible-state bible-state--error">{dailyError}</p>
          )}
          {daily && <PassageDisplay passage={daily} variant="daily" />}
        </section>

        <section className="bible-section" aria-labelledby="read-heading">
          <header className="bible-section__head">
            <span className="bible-section__eyebrow">Read</span>
            <h2 className="bible-section__title" id="read-heading">
              Look up a passage
            </h2>
          </header>

          <form className="bible-search" onSubmit={handleSubmit} role="search">
            <span className="bible-search__icon" aria-hidden="true">⌕</span>
            <input
              type="text"
              className="bible-search__input"
              placeholder="Enter a reference — e.g. Genesis 1, Psalm 23, John 3:16"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              aria-label="Bible reference"
              autoComplete="off"
              spellCheck="false"
            />
            {input && (
              <button
                type="button"
                className="bible-search__clear"
                onClick={clearResult}
                aria-label="Clear"
              >
                ×
              </button>
            )}
            <button type="submit" className="bible-search__submit">
              Read
            </button>
          </form>

          {resultLoading && (
            <p className="bible-state bible-state--loading">Fetching passage&hellip;</p>
          )}
          {resultError && (
            <p className="bible-state bible-state--error">{resultError}</p>
          )}
          {result && !resultLoading && <PassageDisplay passage={result} />}
          {!queryRef && !resultLoading && !resultError && (
            <p className="bible-hint">
              Try <button type="button" className="bible-hint__chip" onClick={() => setSearchParams({ ref: 'Psalm 23' }, { replace: true })}>Psalm 23</button>,{' '}
              <button type="button" className="bible-hint__chip" onClick={() => setSearchParams({ ref: '1 Corinthians 13' }, { replace: true })}>1 Corinthians 13</button>, or{' '}
              <button type="button" className="bible-hint__chip" onClick={() => setSearchParams({ ref: 'Isaiah 53' }, { replace: true })}>Isaiah 53</button>.
            </p>
          )}
        </section>
      </div>
    </section>
  );
}

export default BiblePage;
