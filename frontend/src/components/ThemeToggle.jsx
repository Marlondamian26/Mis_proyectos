import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { FaSun, FaMoon, FaAdjust } from 'react-icons/fa';

const ThemeToggle = () => {
  const { theme, toggleTheme, setThemeAutomatic, isAutomatic } = useTheme();
  const [isRotating, setIsRotating] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

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
    autoIndicator: {
      position: 'absolute',
      bottom: '2px',
      right: '2px',
      width: '12px',
      height: '12px',
      borderRadius: '50%',
      backgroundColor: '#10b981',
      border: '2px solid var(--bg-secondary)',
      transition: 'all 0.3s ease',
    },
    tooltip: {
      position: 'absolute',
      bottom: '70px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: 'var(--bg-secondary)',
      color: 'var(--text-primary)',
      padding: '8px 12px',
      borderRadius: '6px',
      fontSize: '12px',
      whiteSpace: 'nowrap',
      border: '1px solid var(--border-color)',
      pointerEvents: 'none',
      opacity: showTooltip ? 1 : 0,
      transition: 'opacity 0.2s ease',
      zIndex: 1000,
      boxShadow: 'var(--box-shadow)',
    },
  };

  // Estilos dinámicos basados en estado
  const buttonStyle = {
    ...styles.button,
    transform: isHovered ? 'scale(1.1)' : 'scale(1)',
    boxShadow: isHovered ? 'var(--box-shadow-hover)' : 'var(--box-shadow)',
    backgroundColor: isHovered ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
    borderColor: isAutomatic 
      ? (isHovered ? '#10b981' : 'var(--border-color)') 
      : (isHovered ? 'var(--color-admin)' : 'var(--border-color)'),
  };

  // Colores: Sol amarillo, Luna azul, Auto con gradiente
  const iconStyle = {
    ...styles.icon,
    color: isAutomatic 
      ? '#8b5cf6'  // Púrpura para modo automático
      : (theme === 'light' ? '#fbbf24' : '#3b82f6'), // Sol amarillo, Luna azul
    filter: isHovered ? 'brightness(1.2)' : 'brightness(1)',
  };

  const tooltipText = isAutomatic 
    ? 'Modo automático (sigue preferencia del navegador)' 
    : 'Clic derecho para modo automático';

  const handleRightClick = (e) => {
    e.preventDefault();
    setThemeAutomatic();
  };

  return (
    <div style={styles.container}>
      <button
        onClick={toggleTheme}
        onContextMenu={handleRightClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setShowTooltip(false);
        }}
        onMouseOver={() => setShowTooltip(true)}
        style={buttonStyle}
        aria-label={isAutomatic 
          ? 'Modo automático' 
          : (theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro')}
        title={isAutomatic 
          ? 'Clic izquierdo para manual. Clic derecho para automático.' 
          : 'Clic izquierdo para cambiar tema. Clic derecho para automático.'}
      >
        {isAutomatic ? (
          <FaAdjust style={iconStyle} /> // Ícono automático en púrpura
        ) : (theme === 'light' ? (
          <FaMoon style={iconStyle} /> // Luna azul en modo claro
        ) : (
          <FaSun style={iconStyle} />   // Sol amarillo en modo oscuro
        ))}
      </button>
      {isAutomatic && <div style={styles.autoIndicator} />}
      <div style={styles.tooltip}>{tooltipText}</div>
    </div>
  );
};

export default ThemeToggle;