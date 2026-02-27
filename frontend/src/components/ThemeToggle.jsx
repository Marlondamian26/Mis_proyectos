// src/components/ThemeToggle.jsx
import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { FaSun, FaMoon, FaPalette } from 'react-icons/fa';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [isRotating, setIsRotating] = useState(false);

  // Efecto de rotación al cambiar de tema
  useEffect(() => {
    setIsRotating(true);
    const timer = setTimeout(() => setIsRotating(false), 300);
    return () => clearTimeout(timer);
  }, [theme]);

  const styles = {
    container: {
      position: 'relative',
      display: 'inline-block',
    },
    button: {
      background: `var(--${theme === 'light' ? 'bg-secondary' : 'bg-tertiary'})`,
      border: `1px solid var(--border-color)`,
      borderRadius: '40px',
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      cursor: 'pointer',
      color: 'var(--text-primary)',
      fontSize: '14px',
      fontWeight: '500',
      letterSpacing: '0.3px',
      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: isHovered ? 'var(--box-shadow-hover)' : 'var(--box-shadow)',
      transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
      outline: 'none',
    },
    icon: {
      fontSize: '20px',
      transition: 'transform 0.3s ease',
      transform: isRotating ? 'rotate(180deg)' : 'rotate(0)',
      color: `var(--color-${theme === 'light' ? 'patient' : 'nurse'})`,
    },
    sunIcon: {
      color: '#fbbf24',
    },
    moonIcon: {
      color: '#818cf8',
    },
    tooltip: {
      position: 'absolute',
      top: 'calc(100% + 8px)',
      right: '0',
      background: 'var(--bg-secondary)',
      color: 'var(--text-secondary)',
      fontSize: '12px',
      padding: '6px 12px',
      borderRadius: '20px',
      border: `1px solid var(--border-color)`,
      boxShadow: 'var(--box-shadow)',
      whiteSpace: 'nowrap',
      opacity: isHovered ? 1 : 0,
      visibility: isHovered ? 'visible' : 'hidden',
      transition: 'all 0.2s ease',
      pointerEvents: 'none',
    },
  };

  return (
    <div style={styles.container}>
      <button
        onClick={toggleTheme}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={styles.button}
        aria-label="Cambiar tema"
      >
        <span style={styles.icon}>
          {theme === 'light' ? <FaMoon style={styles.moonIcon} /> : <FaSun style={styles.sunIcon} />}
        </span>
        <span>{theme === 'light' ? 'Cambiar a oscuro' : 'Cambiar a claro'}</span>
        <FaPalette style={{ opacity: 0.6, fontSize: '14px' }} />
      </button>
      <div style={styles.tooltip}>
        {theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
      </div>
    </div>
  );
};

export default ThemeToggle;