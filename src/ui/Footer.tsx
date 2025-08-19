import React from 'react';

export const Footer: React.FC = () => (
  <footer className="site-footer">
    <div className="container">
      <div className="footer-top">
        <div className="brand">Prasanna Kulal</div>
        <div className="socials">
          <a href="https://github.com/Prasannakulal" aria-label="GitHub">GH</a>
          <a href="https://www.linkedin.com/in/prasanna-kulal-1887b329a/" aria-label="LinkedIn">IN</a>
        </div>
      </div>
      <div className="footer-bottom">
        <small>© <span>{new Date().getFullYear()}</span> Prasanna Kulal. All rights reserved.</small>
      </div>
    </div>
  </footer>
);


