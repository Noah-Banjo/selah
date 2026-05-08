import { BrowserRouter, NavLink, Link, Routes, Route } from 'react-router-dom';
import './App.css';
import HomePage from './pages/HomePage';
import CharactersPage from './pages/CharactersPage';
import CharacterProfilePage from './pages/CharacterProfilePage';
import MapPage from './pages/MapPage';
import WordsPage from './pages/WordsPage';

const NAV_ITEMS = [
  { label: 'Map', to: '/map' },
  { label: 'Characters', to: '/characters' },
  { label: 'Words', to: '/words' },
];

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <header className="nav">
          <div className="nav__inner">
            <Link className="logo" to="/" aria-label="Selah home">
              <span className="logo__mark" aria-hidden="true" />
              <span className="logo__text">Selah</span>
            </Link>
            <nav className="nav__links" aria-label="Primary">
              {NAV_ITEMS.map((item) =>
                item.to ? (
                  <NavLink
                    key={item.label}
                    to={item.to}
                    className={({ isActive }) =>
                      `nav__link${isActive ? ' nav__link--active' : ''}`
                    }
                  >
                    {item.label}
                  </NavLink>
                ) : (
                  <a key={item.label} className="nav__link" href={item.href}>
                    {item.label}
                  </a>
                )
              )}
            </nav>
          </div>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/characters" element={<CharactersPage />} />
            <Route path="/characters/:id" element={<CharacterProfilePage />} />
            <Route path="/words" element={<WordsPage />} />
          </Routes>
        </main>

        <footer className="footer">
          <div className="footer__inner">
            <span className="footer__brand">Selah</span>
            <span className="footer__meta">© {new Date().getFullYear()}</span>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
