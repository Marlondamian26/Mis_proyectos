import React, { useEffect, useState } from 'react';
import './AnimatedBackground.css';

const AnimatedBackground = () => {
  const [bubbles, setBubbles] = useState([]);
  const [role, setRole] = useState('patient');

  const generateBubbles = () => {
    const newBubbles = [];
    const bubbleCount = 6; // Número reducido de burbujas para mejor rendimiento
    
    for (let i = 0; i < bubbleCount; i++) {
      newBubbles.push({
        id: i,
        size: Math.random() * 120 + 40, // Tamaño entre 40 y 160px (más sutil)
        x: Math.random() * 100, // Posición horizontal
        y: Math.random() * 100, // Posición vertical
        duration: Math.random() * 20 + 15, // Duración entre 15-35 segundos
        delay: Math.random() * -20, // Delay negativo para animación inmediata
        opacity: Math.random() * 0.15 + 0.05 // Opacidad más sutil entre 0.05 y 0.2
      });
    }
    
    setBubbles(newBubbles);
  };

  useEffect(() => {
    // Función para obtener el rol actual
    const getRole = () => localStorage.getItem('user_role') || 'patient';
    
    // Manejar cambios de rol en localStorage
    const handleStorageChange = (e) => {
      if (e.key === 'user_role' || e.key === null) {
        const newRole = getRole();
        setRole(newRole);
      }
    };
    
    // Manejar cambio de tema
    const handleThemeChange = () => setRole(getRole());
    
    // Escuchar eventos
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('themechange', handleThemeChange);
    
    // Initial check
    setRole(getRole());
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
      
      {/* Burbujas animadas sutiles */}
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
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={`particle-${i}`}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 10 + 10}s`,
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default AnimatedBackground;
