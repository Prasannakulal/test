import React from 'react';

export const Experience: React.FC = () => (
  <section className="section" id="experience">
    <div className="container reveal">
      <h2>Experience</h2>
      <div className="timeline">
        <article className="timeline-item">
          <div className="time">Feb 2025</div>
          <div className="content">
            <h3>Deep Learning Intern · Accolade Tech Solution</h3>
            <p>Hands‑on with deep learning fundamentals and basic neural networks.</p>
            <ul className="list compact">
              <li>Data preprocessing and model training using Python with TensorFlow/PyTorch</li>
            </ul>
          </div>
        </article>
        <article className="timeline-item">
          <div className="time">Oct 2023</div>
          <div className="content">
            <h3>MERN Stack Development Intern · Technical Career Education</h3>
            <p>Contributed to full‑stack web apps using MongoDB, Express.js, React, and Node.js.</p>
            <ul className="list compact">
              <li>Collaborated to design and implement interactive, user‑friendly interfaces</li>
            </ul>
          </div>
        </article>
      </div>
    </div>
  </section>
);


