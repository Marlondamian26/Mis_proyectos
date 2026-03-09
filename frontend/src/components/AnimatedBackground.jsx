import React from 'react';
import './AnimatedBackground.css';

const AnimatedBackground = () => {
  return (
    <div className="animated-background">
      {/* Elementos flotantes principales */}
      <div className="floating-element floating-1"></div>
      <div className="floating-element floating-2"></div>
      <div className="floating-element floating-3"></div>

      {/* Partículas pequeñas */}
      <div className="particles">
        {Array.from({ length: 20 }, (_, i) => (
          <div key={i} className={`particle particle-${i + 1}`}></div>
        ))}
      </div>

      {/* Gradiente de fondo dinámico */}
      <div className="background-gradient"></div>
    </div>
  );
};

export default AnimatedBackground;