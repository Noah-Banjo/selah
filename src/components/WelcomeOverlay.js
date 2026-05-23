import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const KEY = 'selah:welcomed';

const FEATURES = [
  {
    icon: '🗺',
    title: 'Map',
    desc: 'Trace biblical journeys across the ancient Near East — from Eden to Patmos.',
    path: '/map',
  },
  {
    icon: '👤',
    title: 'Characters',
    desc: '141 biblical figures with biographies, references, and relationship maps.',
    path: '/characters',
  },
  {
    icon: '📜',
    title: 'Words',
    desc: 'The original Hebrew and Greek behind the text — transliterated and explained.',
    path: '/words',
  },
  {
    icon: '⏱',
    title: 'Timeline',
    desc: 'Two thousand years of biblical history plotted from Abraham to the apostles.',
    path: '/timeline',
  },
];

export function WelcomeOverlay() {
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem(KEY)) {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(KEY, '1');
    setVisible(false);
  };

  const go = (path) => {
    dismiss();
    navigate(path);
  };

  if (!visible) return null;

  return (
    <div className="welcome-overlay" role="dialog" aria-modal="true" aria-label="Welcome to Selah">
      <div className="welcome-modal">
        <div className="welcome-modal__header">
          <span className="welcome-modal__eyebrow">Welcome</span>
          <h2 className="welcome-modal__title">Selah</h2>
          <p className="welcome-modal__sub">An interactive atlas of the biblical world</p>
        </div>

        <ul className="welcome-features">
          {FEATURES.map((f) => (
            <li key={f.title}>
              <button
                type="button"
                className="welcome-feature"
                onClick={() => go(f.path)}
              >
                <span className="welcome-feature__icon" aria-hidden="true">{f.icon}</span>
                <span className="welcome-feature__body">
                  <strong className="welcome-feature__title">{f.title}</strong>
                  <span className="welcome-feature__desc">{f.desc}</span>
                </span>
                <span className="welcome-feature__arrow" aria-hidden="true">→</span>
              </button>
            </li>
          ))}
        </ul>

        <button
          type="button"
          className="welcome-modal__cta"
          onClick={dismiss}
        >
          Start Exploring
        </button>

        <button
          type="button"
          className="welcome-modal__skip"
          onClick={dismiss}
          aria-label="Dismiss welcome"
        >
          ×
        </button>
      </div>
    </div>
  );
}
