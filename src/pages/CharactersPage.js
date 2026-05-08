import { Link } from 'react-router-dom';
import characters from '../data/characters.json';

function CharactersPage() {
  return (
    <section className="page">
      <div className="page__inner">
        <header className="page__header">
          <span className="page__eyebrow">Lives</span>
          <h1 className="page__title">Characters</h1>
          <p className="page__lede">
            The prophets, kings, and unnamed witnesses whose stories shape the
            biblical world.
          </p>
        </header>

        <div className="character-grid">
          {characters.map((c) => (
            <article key={c.id} className="character-card">
              <div className="character-card__body">
                <h2 className="character-card__name">{c.name}</h2>
                <span className="character-card__period">{c.period}</span>
                <p className="character-card__description">{c.description}</p>
              </div>
              <Link to={`/characters/${c.id}`} className="character-card__cta">
                View Profile
                <span aria-hidden="true">→</span>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CharactersPage;
