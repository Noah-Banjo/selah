import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  BrowserRouter,
  NavLink,
  Link,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom';
import './App.css';
import HomePage from './pages/HomePage';
import CharactersPage from './pages/CharactersPage';
import CharacterProfilePage from './pages/CharacterProfilePage';
import MapPage from './pages/MapPage';
import WordsPage from './pages/WordsPage';
import TimelinePage from './pages/TimelinePage';
import BiblePage from './pages/BiblePage';
import RelationshipsPage from './pages/RelationshipsPage';

const NAV_ITEMS = [
  { label: 'Map', to: '/map' },
  { label: 'Characters', to: '/characters' },
  { label: 'Words', to: '/words' },
  { label: 'Timeline', to: '/timeline' },
  { label: 'Bible', to: '/bible' },
  { label: 'Network', to: '/relationships' },
];

function NavBar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  return (
    <>
    <header className={`nav${open ? ' nav--menu-open' : ''}`}>
      <div className="nav__inner">
        <Link className="logo" to="/" aria-label="Selah home">
          <span className="logo__mark" aria-hidden="true" />
          <span className="logo__text">Selah</span>
        </Link>

        <nav className="nav__links" aria-label="Primary">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                `nav__link${isActive ? ' nav__link--active' : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          className={`nav__hamburger${open ? ' nav__hamburger--open' : ''}`}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
      </div>

    </header>

    {createPortal(
      <div
        className={`nav__overlay${open ? ' nav__overlay--open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
      >
        <nav className="nav__overlay-links" aria-label="Mobile primary">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                `nav__overlay-link${isActive ? ' nav__overlay-link--active' : ''}`
              }
              onClick={() => setOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>,
      document.body
    )}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <NavBar />

        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/characters" element={<CharactersPage />} />
            <Route path="/characters/:id" element={<CharacterProfilePage />} />
            <Route path="/words" element={<WordsPage />} />
            <Route path="/timeline" element={<TimelinePage />} />
            <Route path="/bible" element={<BiblePage />} />
            <Route path="/relationships" element={<RelationshipsPage />} />
          </Routes>
        </main>

        <footer className="footer">
          <div className="footer__inner">
            <span className="footer__brand">Built with curiosity and reverence</span>
            <nav className="footer__nav" aria-label="Footer">
              {NAV_ITEMS.map((item) => (
                <Link key={item.label} to={item.to} className="footer__link">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
