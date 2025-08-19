import React from 'react';

export const Header: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [theme, setTheme] = React.useState<'light' | 'dark'>(() => {
    const stored = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (stored) return stored;
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
    return prefersDark ? 'dark' : 'light';
  });

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
      <div className={`container nav ${open ? 'open' : ''}`}>
        <a className="brand" href="#home" aria-label="Go to home">PK</a>
        <nav className="nav-links" aria-label="Primary Navigation">
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#projects">Projects</a>
          <a href="#contact">Contact</a>
        </nav>
        <div className="header-actions">
          <button id="theme-toggle" className="icon-btn" aria-label="Toggle dark mode" title="Toggle theme"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            <span className="icon">{theme === 'dark' ? '🌞' : '🌙'}</span>
          </button>
          <button id="nav-toggle" className="icon-btn mobile-only" aria-label="Toggle navigation" title="Menu"
            onClick={() => setOpen(!open)}>
            <span className="icon">☰</span>
          </button>
        </div>
      </div>
    </header>
  );
};


