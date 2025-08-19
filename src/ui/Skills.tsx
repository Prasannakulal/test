import React from 'react';

const skills = [
  'Python','Java','HTML','CSS','SQL','NumPy','Pandas','Matplotlib','scikit‑learn','TensorFlow','PyTorch','MongoDB','Express.js','React','Node.js','Bootstrap','Postman','Oracle','MySQL','Machine Learning','Artificial Intelligence','DBMS','NLP','VS Code','Google Colab'
];

export const Skills: React.FC = () => (
  <section className="section" id="skills">
    <div className="container reveal">
      <h2>Skills</h2>
      <div className="chips">
        {skills.map(s => <span key={s} className="chip">{s}</span>)}
      </div>
    </div>
  </section>
);


