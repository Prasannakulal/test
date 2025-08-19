import React from 'react';

export const Projects: React.FC = () => (
  <section className="section cinematic-projects" id="projects">
    <div className="container reveal">
      <h2>Projects</h2>
      <div className="grid three">
        {[
          {
            title: 'GenCl — AI‑Powered Chat Platform',
            desc: 'React + Node.js chat app with LLM integrations (Gemini 1.5 Pro, DeepSeek), dynamic model switching, markdown rendering, and CI/CD (Netlify + Render).',
            tags: ['React','Node.js','LLM','REST','Context API','Netlify','Render']
          },
          {
            title: 'OneClickOrder',
            desc: 'MERN full‑stack parcel ordering and tracking with responsive UI and optimized API performance.',
            tags: ['MongoDB','Express.js','React','Node.js','Bootstrap','Postman']
          },
          {
            title: 'Pepper Disease Classification',
            desc: 'Image‑processing and ML pipeline to classify pepper plant diseases with custom dataset and Streamlit UI.',
            tags: ['Python','Image Processing','Machine Learning','Streamlit']
          }
        ].map(p => (
          <article key={p.title} className="card project cinematic-card">
            <div className="project-thumb parallax" aria-hidden="true" />
            <div className="project-body">
              <h3>{p.title}</h3>
              <p>{p.desc}</p>
              <div className="tags">
                {p.tags.map(t => <span key={t}>{t}</span>)}
              </div>
              <div className="project-actions">
                <a className="btn small" href="#" target="_blank" rel="noopener">Live</a>
                <a className="btn small ghost" href="#" target="_blank" rel="noopener">Code</a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  </section>
);


