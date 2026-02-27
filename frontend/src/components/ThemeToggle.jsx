import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { FaSun, FaMoon } from 'react-icons/fa';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const [isRotating, setIsRotating] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Efecto de rotación al cambiar de tema
  useEffect(() => {
    setIsRotating(true);
    const timer = setTimeout(() => setIsRotating(false), 500);
    return () => clearTimeout(timer);
  }, [theme]);

  const styles = {
    container: {
      position: 'relative',
      display: 'inline-block',
    },
    button: {
      background: 'var(--bg-secondary)',
      border: '2px solid var(--border-color)',
      borderRadius: '50%',
      width: '55px',
      height: '55px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      color: 'var(--text-primary)',
      transition: 'all 0.3s ease',
      boxShadow: 'var(--box-shadow)',
      outline: 'none',
    },
    icon: {
      fontSize: '32px',
      transition: 'transform 0.5s ease, color 0.3s ease',
      transform: isRotating ? 'rotate(360deg)' : 'rotate(0)',
    },
  };

  // Estilos dinámicos basados en estado
  const buttonStyle = {
    ...styles.button,
    transform: isHovered ? 'scale(1.1)' : 'scale(1)',
    boxShadow: isHovered ? 'var(--box-shadow-hover)' : 'var(--box-shadow)',
    backgroundColor: isHovered ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
    borderColor: isHovered ? 'var(--color-admin)' : 'var(--border-color)',
  };

  // Colores CORREGIDOS: Sol amarillo, Luna azul
  const iconStyle = {
    ...styles.icon,
    color: theme === 'light' ? '#fbbf24' : '#3b82f6', // Sol amarillo (#fbbf24), Luna azul (#3b82f6)
    filter: isHovered ? 'brightness(1.2)' : 'brightness(1)',
  };

  return (
    <div style={styles.container}>
      <button
        onClick={toggleTheme}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={buttonStyle}
        aria-label={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
        title={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
      >
        {theme === 'light' ? (
          <FaMoon style={iconStyle} /> // Luna azul en modo claro
        ) : (
          <FaSun style={iconStyle} />   // Sol amarillo en modo oscuro
        )}
      </button>
    </div>
  );
};

export default ThemeToggle;