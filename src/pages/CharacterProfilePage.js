import { Link, useParams } from 'react-router-dom';
import characters from '../data/characters.json';
import { findLocationByLabel } from '../data/locationLookup';

function CharacterProfilePage() {
  const { id } = useParams();
  const character = characters.find((c) => c.id === id);

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

  return (
    <section className="page">
      <div className="page__inner profile">
        <Link to="/characters" className="back-link">
          ← All Characters
        </Link>

        <header className="profile__header">
          <span className="profile__eyebrow">{character.period}</span>
          <h1 className="profile__name">{character.fullName}</h1>
          <p className="profile__description">{character.description}</p>
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
            {character.references.map((r) => (
              <li key={r.ref} className="reference">
                <span className="reference__ref">{r.ref}</span>
                <span className="reference__note">{r.note}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default CharacterProfilePage;
