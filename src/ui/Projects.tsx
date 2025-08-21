import React from 'react';
import OneclickOrderImg from '../assets/OneclickOrder.png';
import PepperDiseaseImg from '../assets/PepperDisease.png';
import CollegeDatabaseImg from '../assets/CollegeDatabase.png';
import BagroundRemovalImg from '../assets/BagroundRemoval.png';
import GenclImg from '../assets/Gencl.png';

export const Projects: React.FC = () => (
  <section className="section cinematic-projects" id="projects">
    <div className="container reveal">
      <h2>Projects</h2>
      <div className="grid three">
        {[
          {
            title: 'GenCl — AI‑Powered Chat Platform',
            desc: 'React + Node.js chat app with LLM integrations (Gemini 1.5 Pro, DeepSeek), dynamic model switching, markdown rendering, and CI/CD (Netlify + Render).',
            tags: ['React','Node.js','LLM','REST','Context API','Netlify','Render'],
            img: GenclImg,
            live: 'https://gencl.netlify.app/',
            code: 'https://github.com/Prasannakulal/GenCl-AI-Powered-Chat-Platform'
          },
          {
            title: 'Background Removal',
            desc: 'Automatic image background removal with segmentation and clean edge matting.',
            tags: ['Computer Vision','Python','Segmentation'],
            img: BagroundRemovalImg,
            live: 'https://bgremover-lime.vercel.app/',
            code: 'https://github.com/Prasannakulal/bg-frontend'
          },
          {
            title: 'OneClickOrder',
            desc: 'MERN full‑stack parcel ordering and tracking with responsive UI and optimized API performance.',
            tags: ['MongoDB','Express.js','React','Node.js','Bootstrap','Postman'],
            img: OneclickOrderImg,
            live: 'https://github.com/Prasannakulal/OneClickOrder',
            code: 'https://github.com/Prasannakulal/OneClickOrder'
          },
          {
            title: 'Pepper Disease Classification',
            desc: 'Image‑processing and ML pipeline to classify pepper plant diseases with custom dataset and Streamlit UI.',
            tags: ['Python','Image Processing','Machine Learning','Streamlit'],
            img: PepperDiseaseImg,
            live: 'https://pepper-disease-classifier.streamlit.app',
            code: 'https://github.com/Prasannakulal/pepper-disease-classifier'
          },
          {
            title: 'College Database',
            desc: 'Relational database project with clean schema design and queries for academic records.',
            tags: ['SQL','DB Design','Queries'],
            img: CollegeDatabaseImg,
            live: 'https://college-db-demo.vercel.app',
            code: 'https://github.com/Prasannakulal/college-database'
          }
          
        ].map(p => (
          <article key={p.title} className="card project cinematic-card">
            <div className="project-thumb parallax" aria-hidden="true">
              {p.img ? <img src={p.img} alt={`${p.title} screenshot`} loading="lazy" /> : null}
            </div>
            <div className="project-body">
              <h3>{p.title}</h3>
              <p>{p.desc}</p>
              <div className="tags">
                {p.tags.map(t => <span key={t}>{t}</span>)}
              </div>
              <div className="project-actions">
                {p.live && <a className="btn small" href={p.live} target="_blank" rel="noopener">Live</a>}
                {p.code && <a className="btn small ghost" href={p.code} target="_blank" rel="noopener">Code</a>}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  </section>
);


