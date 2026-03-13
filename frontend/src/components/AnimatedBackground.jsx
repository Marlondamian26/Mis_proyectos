import React, { useEffect, useState } from 'react';
import './AnimatedBackground.css';

const AnimatedBackground = () => {
  const [bubbles, setBubbles] = useState([]);
  const [role, setRole] = useState('patient');

  const generateBubbles = () => {
    const newBubbles = [];
    const bubbleCount = 8; // Número de burbujas
    
    for (let i = 0; i < bubbleCount; i++) {
      newBubbles.push({
        id: i,
        size: Math.random() * 150 + 50, // Tamaño entre 50 y 200px
        x: Math.random() * 100, // Posición horizontal
        y: Math.random() * 100, // Posición vertical
        duration: Math.random() * 20 + 15, // Duración entre 15-35 segundos
        delay: Math.random() * -20, // Delay negativo para animación inmediata
        opacity: Math.random() * 0.3 + 0.1 // Opacidad entre 0.1 y 0.4
      });
    }
    
    setBubbles(newBubbles);
  };

  useEffect(() => {
    // Función para obtener el rol actual
    const getRole = () => localStorage.getItem('user_role') || 'patient';
    
    // Manejar cambios de rol en localStorage (incluyeStorage events para múltiples tabs)
    const handleStorageChange = (e) => {
      // Si el evento viene de storage, verificar si fue el user_role
      if (e.key === 'user_role' || e.key === null) {
        const newRole = getRole();
        setRole(newRole);
      }
    };
    
    // Manejar cambio de tema
    const handleThemeChange = () => setRole(getRole());
    
    // Escuchar eventos de storage (cambios en otras tabs)
    window.addEventListener('storage', handleStorageChange);
    
    // Escuchar evento de cambio de tema
    window.addEventListener('themechange', handleThemeChange);
    
    // Initial check
    setRole(getRole());

    // Generar burbujas
    generateBubbles();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('themechange', handleThemeChange);
    };
  }, []);

  // Generar estilos dinámicos para cada burbuja
  const getBubbleStyle = (bubble) => ({
    width: `${bubble.size}px`,
    height: `${bubble.size}px`,
    left: `${bubble.x}%`,
    top: `${bubble.y}%`,
    animationDuration: `${bubble.duration}s`,
    animationDelay: `${bubble.delay}s`,
    opacity: bubble.opacity,
  });

  return (
    <div className="animated-background" data-role={role}>
      {/* Gradiente de fondo dinámico */}
      <div className="background-gradient"></div>
      
      {/* Capa de elementos flotantes */}
      <div className="floating-elements"></div>
      
      {/* Burbujas animadas */}
      <div className="bubbles-container">
        {bubbles.map((bubble) => (
          <div
            key={bubble.id}
            className={`bubble bubble-${(bubble.id % 4) + 1}`}
            style={getBubbleStyle(bubble)}
          />
        ))}
      </div>
      
      {/* Partículas pequeñas adicionales */}
      <div className="particles">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={`particle-${i}`}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 10 + 10}s`,
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default AnimatedBackground;
