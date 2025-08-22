import React, { useEffect, useRef, useState } from 'react';

export const Hero: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  const fullText = "Full Stack Developer • MERN Stack • AI/ML Engineer";

  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    setIsVisible(true);
    
    // Professional typewriter effect
    const typewriter = setInterval(() => {
      if (currentIndex < fullText.length) {
        setCurrentText(fullText.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      } else {
        clearInterval(typewriter);
      }
    }, 80);

    return () => {
      clearInterval(typewriter);
      window.removeEventListener('resize', checkMobile);
    };
  }, [currentIndex, fullText.length]);

  return (
    <section 
      ref={heroRef}
      className="cinematic-hero professional-hero" 
      id="home"
    >
      {/* Video background - hidden on mobile */}
      {!isMobile && (
        <video 
          className="bg-video" 
          playsInline 
          autoPlay 
          muted 
          loop
          preload="auto"
        >
          <source src="/cinematic.mp4" type="video/mp4" />
        </video>
      )}
      
      {/* Professional overlay */}
      <div className="overlay professional-overlay" />
      
      {/* Main hero content */}
      <div className="hero-center professional-hero-center">
        {/* Elegant greeting */}
        <div className="greeting-section">
          <span className="greeting-text">Hello, I'm</span>
        </div>
        
        {/* Professional title */}
        <h1 className="hero-title professional-title">
          <span className="title-main">PRASANNA</span>
          <span className="title-accent">KULAL</span>
        </h1>
        
        {/* Professional subtitle */}
        <div className="hero-sub-container">
          <p className="hero-sub professional-sub">
            <span className="typewriter-text">{currentText}</span>
            <span className="cursor">|</span>
          </p>
        </div>
        
        {/* Professional CTA buttons */}
        <div className="cta professional-cta">
          <a className="btn primary professional-btn" href="#projects">
            <span className="btn-text">View Projects</span>
            <span className="btn-icon">→</span>
          </a>
          <a className="btn outline professional-btn" href="/PrasannaKulal_Resume_ (23).pdf" download="Prasanna_Kulal_Resume.pdf">
            <span className="btn-text">Download Resume</span>
            <span className="btn-icon">↓</span>
          </a>
        </div>
      </div>
      
      {/* Professional scroll indicator */}
      <div className="scroll-indicator professional-scroll">
        <div className="scroll-line" />
        <span className="scroll-text">Scroll to explore</span>
      </div>
    </section>
  );
};


