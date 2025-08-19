import React from 'react';

export const Hero: React.FC = () => {
  return (
    <section className="cinematic-hero" id="home">
      <video className="bg-video" playsInline autoPlay muted loop>
        <source src="/cinematic.mp4" type="video/mp4" />
      </video>
      <div className="overlay" />
      <div className="hero-center">
        <h1 className="hero-title">
          PRASANNA <span className="glow">KULAL</span>
        </h1>
        <p className="hero-sub">CSE (AIML) • MERN • AI/ML</p>
        <div className="cta">
          <a className="btn primary" href="#projects">View Projects</a>
          <a className="btn outline" href="/PrasannaKulal_Resume_ (23).pdf" download="Prasanna_Kulal_Resume.pdf">Download résumé</a>
        </div>
      </div>
      <div className="scroll-indicator">Scroll</div>
    </section>
  );
};


