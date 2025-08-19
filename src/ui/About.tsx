import React from 'react';

export const About: React.FC = () => (
  <section className="section" id="about">
    <div className="container grid two">
      <div className="reveal">
        <h2>About</h2>
        <p>
          Bachelor of Engineering student (CSE — AIML) at Sahyadri College of Engineering and Management
          with hands‑on projects in MERN and AI/ML. Passionate about building practical applications,
          learning fast, and solving problems.
        </p>
        <ul className="list">
          <li>Areas: Machine Learning, Artificial Intelligence, DBMS, NLP</li>
          <li>Soft skills: Problem solving, Self‑learning, Quick thinking, Adaptability</li>
          <li>CGPA: 8.1 (2021–2025)</li>
        </ul>
        <div className="cta">
          <a className="btn" href="mailto:prasannakulal18@gmail.com">Email me</a>
          <a className="btn ghost" href="#projects">View projects</a>
        </div>
      </div>
      <div className="reveal">
        <div className="card">
          <h3>Education</h3>
          <ul className="list">
            <li>Sahyadri College — B.E. CSE (AIML), 2021–2025</li>
            <li>SDM PU College — Karnataka State Board, 2019–2021</li>
            <li>Sacred Heart English Medium School — Karnataka State Board, 2019</li>
          </ul>
        </div>
      </div>
    </div>
  </section>
);


