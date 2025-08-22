import React, { useState, useEffect, useRef } from 'react';

interface Skill {
  name: string;
  level: number;
  color: string;
}

const skillCategories = [
  {
    name: "Frontend",
    skills: [
      { name: "React", level: 80, color: "#61DAFB" },
      { name: "TypeScript", level: 50, color: "#3178C6" },
      { name: "HTML/CSS", level: 90, color: "#E34F26" },
      { name: "JavaScript", level: 70, color: "#F7DF1E" }
    ]
  },
  {
    name: "Backend",
    skills: [
      { name: "Node.js", level: 70, color: "#339933" },
      { name: "Python", level: 90, color: "#3776AB" },
      { name: "MongoDB", level: 80, color: "#47A248" },
      { name: "MySQL", level: 90, color: "#4479A1" }
    ]
  },
  {
    name: "AI/ML",
    skills: [
      { name: "Machine Learning", level: 85, color: "#FF6B6B" },
      { name: "TensorFlow", level: 80, color: "#FF6F00" },
      { name: "PyTorch", level: 75, color: "#EE4C2C" },
      { name: "Computer Vision", level: 82, color: "#4ECDC4" }
    ]
  },
  {
    name: "Tools",
    skills: [
      { name: "Git", level: 88, color: "#F05032" },
      { name: "Docker", level: 70, color: "#2496ED" },
      { name: "VS Code", level: 95, color: "#007ACC" },
      { name: "AWS", level: 55, color: "#FF9900" }
    ]
  }
];

export const Skills: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const skillsRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (skillsRef.current) {
      observer.observe(skillsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section className="section enhanced-skills" id="skills" ref={skillsRef}>
      <div className="container">
        {/* Simple Header */}
        <div className="skills-header">
          <h2 className="section-title">Skills</h2>
          <p className="section-subtitle">Technologiaa I work with</p>
        </div>

        {/* Category Navigation */}
        <div className="category-nav">
          {skillCategories.map((category, index) => (
            <button
              key={category.name}
              className={`category-btn ${activeCategory === index ? 'active' : ''}`}
              onClick={() => setActiveCategory(index)}
              style={{ '--index': index } as React.CSSProperties}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Skills Display */}
        <div className="skills-display">
          <div className="skills-grid">
            {skillCategories[activeCategory].skills.map((skill, index) => (
              <div 
                key={skill.name} 
                className="skill-card"
                style={{ 
                  '--delay': index * 0.1,
                  '--skill-color': skill.color
                } as React.CSSProperties}
              >
                <div className="skill-header">
                  <h3 className="skill-name">{skill.name}</h3>
                  <span className="skill-level">{skill.level}%</span>
                </div>
                
                <div className="progress-container">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${skill.level}%`,
                        backgroundColor: skill.color
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Skills */}
        <div className="additional-skills">
          <div className="skills-chips">
            {['REST APIs', 'GraphQL', 'Firebase', 'Jest', 'Webpack', 'CI/CD'].map((skill, index) => (
              <span 
                key={skill} 
                className="skill-chip"
                style={{ '--delay': index * 0.05 } as React.CSSProperties}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};


