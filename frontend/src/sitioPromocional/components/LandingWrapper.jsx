import React, { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { FaSun, FaMoon, FaAdjust } from 'react-icons/fa';
import '../styles/promocional.css';

import Navbar from './Navbar';
import Hero from './Hero';
import Servicios from './Servicios';
import SobreNosotros from './SobreNosotros';
import Testimonios from './Testimonios';
import Contacto from './Contacto';
import CTA from './CTA';
import Footer from './Footer';

const toggleContainerStyle = {
  position: 'fixed',
  top: '90px',
  right: '25px',
  zIndex: 2000,
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};

const buttonBaseStyle = {
  background: '#ffffff',
  border: '3px solid #00a896',
  borderRadius: '12px',
  width: '48px',
  height: '48px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  color: '#0f172a',
  transition: 'all 0.3s ease',
  boxShadow: '0 4px 16px rgba(0, 168, 150, 0.3)',
  outline: 'none',
};

const buttonBaseStyleDark = {
  background: '#1e293b',
  border: '3px solid #02c4ac',
  color: '#f1f5f9',
  boxShadow: '0 4px 16px rgba(2, 196, 172, 0.3)',
};

const buttonHoverStyle = {
  transform: 'scale(1.1)',
  boxShadow: '0 6px 24px rgba(0, 168, 150, 0.4)',
};

const buttonActiveStyle = {
  transform: 'scale(0.95)',
};

function PromoThemeToggle() {
  const { theme, toggleTheme, isAutomatic } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);
  
  const getIcon = () => {
    if (isAutomatic) {
      return <FaAdjust style={{ fontSize: '20px', color: '#8b5cf6' }} />;
    }
    return theme === 'light' 
      ? <FaMoon style={{ fontSize: '20px', color: '#3b82f6' }} />
      : <FaSun style={{ fontSize: '20px', color: '#fbbf24' }} />;
  };

  const isDark = theme === 'dark';
  let currentStyle = isDark ? { ...buttonBaseStyle, ...buttonBaseStyleDark } : { ...buttonBaseStyle };
  if (isHovered) currentStyle = { ...currentStyle, ...buttonHoverStyle };
  if (isActive) currentStyle = { ...currentStyle, ...buttonActiveStyle };

  return (
    <button 
      onClick={toggleTheme} 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={() => setIsActive(true)}
      onMouseUp={() => setIsActive(false)}
      style={currentStyle}
      title={isAutomatic ? 'Modo automático (sigue preferencia del sistema)' : `Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`}
      aria-label={isAutomatic ? 'Modo automático' : `Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`}
    >
      {getIcon()}
    </button>
  );
}

function PromoLanguageToggle() {
  const { language, setLanguage } = useLanguage();
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);
  
  const languages = [
    { code: 'pt', name: 'Portugués', flag: 'PT' },
    { code: 'es', name: 'Español', flag: 'ES' },
    { code: 'en', name: 'English', flag: 'EN' }
  ];

  const cycleLanguage = () => {
    const currentIndex = languages.findIndex(l => l.code === language);
    const nextIndex = (currentIndex + 1) % languages.length;
    setLanguage(languages[nextIndex].code);
  };

  const currentLang = languages.find(l => l.code === language) || languages[0];
  const isDark = theme === 'dark';
  let currentStyle = isDark ? { ...buttonBaseStyle, ...buttonBaseStyleDark } : { ...buttonBaseStyle };
  if (isHovered) currentStyle = { ...currentStyle, ...buttonHoverStyle };
  if (isActive) currentStyle = { ...currentStyle, ...buttonActiveStyle };

  return (
    <button 
      onClick={cycleLanguage}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={() => setIsActive(true)}
      onMouseUp={() => setIsActive(false)}
      style={currentStyle}
      title={`Idioma: ${currentLang.name}. Haz clic para cambiar.`}
      aria-label={`Cambiar idioma. Actual: ${currentLang.name}`}
    >
      <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#8b5cf6' }}>
        {currentLang.flag}
      </span>
    </button>
  );
}

function LandingWrapper() {
  const { theme } = useTheme();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="sitio-promocional" data-theme={theme}>
      <div style={toggleContainerStyle}>
        <PromoThemeToggle />
        <PromoLanguageToggle />
      </div>
      
      <Navbar />
      
      <main style={{ marginTop: '80px' }}>
        <section id="inicio">
          <Hero />
        </section>
        
        <Servicios />
        
        <SobreNosotros />
        
        <Testimonios />
        
        <Contacto />
        
        <CTA />
      </main>
      
      <Footer />
    </div>
  );
}

export default LandingWrapper;