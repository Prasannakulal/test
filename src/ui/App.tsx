import React from 'react';
import { SolarSystemBackground } from './SolarSystemBackground';
import { Header } from './Header';
import { Hero } from './Hero';
import { About } from './About';
import { Skills } from './Skills';
import { Projects } from './Projects';
import { Experience } from './Experience';
import { Contact } from './Contact';
import { Footer } from './Footer';

export const App: React.FC = () => {
  return (
    <>
      <SolarSystemBackground />
      <Header />
      <main id="home">
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Experience />
        <Contact />
      </main>
      <Footer />
    </>
  );
};


