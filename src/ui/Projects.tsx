import React, { useEffect, useRef, useState } from 'react';

export const Projects: React.FC = () => {
  const [cardPositions, setCardPositions] = useState<{ [key: string]: { x: number; y: number } }>({});
  const cardsRef = useRef<{ [key: string]: HTMLElement | null }>({});
  const animationRef = useRef<number>();

  useEffect(() => {
    const checkCollisionWithSun = () => {
      const sunCenterX = window.innerWidth * 0.6; // Sun is positioned at 60% of screen width
      const sunCenterY = window.innerHeight * 0.4; // Sun is positioned at 40% of screen height
      const sunRadius = 80; // Approximate sun radius in pixels
      const cardRadius = 150; // Approximate card radius in pixels
      const safeDistance = sunRadius + cardRadius + 20; // Extra buffer

      const newPositions: { [key: string]: { x: number; y: number } } = {};

      Object.keys(cardsRef.current).forEach((key) => {
        const card = cardsRef.current[key];
        if (!card) return;

        const rect = card.getBoundingClientRect();
        const cardCenterX = rect.left + rect.width / 2;
        const cardCenterY = rect.top + rect.height / 2;

        const distance = Math.sqrt(
          Math.pow(cardCenterX - sunCenterX, 2) + Math.pow(cardCenterY - sunCenterY, 2)
        );

        if (distance < safeDistance) {
          // Calculate direction to move away from sun
          const angle = Math.atan2(cardCenterY - sunCenterY, cardCenterX - sunCenterX);
          const moveDistance = safeDistance - distance;
          
          // Move card sideways (perpendicular to the line between card and sun)
          const perpendicularAngle = angle + Math.PI / 2;
          const moveX = Math.cos(perpendicularAngle) * moveDistance * 0.5;
          const moveY = Math.sin(perpendicularAngle) * moveDistance * 0.3;

          newPositions[key] = { x: moveX, y: moveY };
        } else {
          // Gradually return to original position
          const currentPos = cardPositions[key] || { x: 0, y: 0 };
          newPositions[key] = { 
            x: currentPos.x * 0.9, 
            y: currentPos.y * 0.9 
          };
        }
      });

      setCardPositions(newPositions);
      animationRef.current = requestAnimationFrame(checkCollisionWithSun);
    };

    animationRef.current = requestAnimationFrame(checkCollisionWithSun);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [cardPositions]);

  const projects = [
    {
      title: 'GenCl — AI‑Powered Chat Platform',
      desc: 'React + Node.js chat app with LLM integrations (Gemini 1.5 Pro, DeepSeek), dynamic model switching, markdown rendering, and CI/CD (Netlify + Render).',
      tags: ['React','Node.js','LLM','REST','Context API','Netlify','Render'],
      live: 'https://gencl.netlify.app/',
      code: 'https://github.com/Prasannakulal/GenCl-AI-Powered-Chat-Platform'
    },
    {
      title: 'Background Removal',
      desc: 'Automatic image background removal with segmentation and clean edge matting.',
      tags: ['Computer Vision','Python','Segmentation'],
      live: 'https://bgremover-lime.vercel.app/',
      code: 'https://github.com/Prasannakulal/bg-frontend'
    },
    {
      title: 'OneClickOrder',
      desc: 'MERN full‑stack parcel ordering and tracking with responsive UI and optimized API performance.',
      tags: ['MongoDB','Express.js','React','Node.js','Bootstrap','Postman'],
      live: 'https://github.com/Prasannakulal/OneClickOrder',
      code: 'https://github.com/Prasannakulal/OneClickOrder'
    },
    {
      title: 'Pepper Disease Classification',
      desc: 'Image‑processing and ML pipeline to classify pepper plant diseases with custom dataset and Streamlit UI.',
      tags: ['Python','Image Processing','Machine Learning','Streamlit'],
      live: 'https://pepper-disease-classifier.streamlit.app',
      code: 'https://github.com/Prasannakulal/pepper-disease-classifier'
    },
    {
      title: 'College Database',
      desc: 'Relational database project with clean schema design and queries for academic records.',
      tags: ['SQL','DB Design','Queries'],
      live: 'https://college-db-demo.vercel.app',
      code: 'https://github.com/Prasannakulal/college-database'
    }
  ];

  return (
    <section className="section cinematic-projects" id="projects">
      <div className="container reveal">
        <h2>Projects</h2>
        <div className="grid three">
          {projects.map((p, index) => {
            const cardKey = `card-${index}`;
            const position = cardPositions[cardKey] || { x: 0, y: 0 };
            
            return (
              <article 
                key={p.title} 
                className="card project cinematic-card"
                ref={(el) => { cardsRef.current[cardKey] = el; }}
                style={{
                  transform: `translate(${position.x}px, ${position.y}px)`,
                  transition: 'transform 0.3s ease-out'
                }}
              >
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
            );
          })}
        </div>
      </div>
    </section>
  );
};


