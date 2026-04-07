import React, { useEffect } from 'react';
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
  top: '20px',
  right: '20px',
  zIndex: 1000,
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
};

const buttonBaseStyle = {
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
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
};

function PromoThemeToggle() {
  const { theme, toggleTheme, isAutomatic } = useTheme();
  
  const getIcon = () => {
    if (isAutomatic) {
      return <FaAdjust style={{ fontSize: '24px', color: '#8b5cf6' }} />;
    }
    return theme === 'light' 
      ? <FaMoon style={{ fontSize: '24px', color: '#3b82f6' }} />
      : <FaSun style={{ fontSize: '24px', color: '#fbbf24' }} />;
  };

  return (
    <button 
      onClick={toggleTheme} 
      style={buttonBaseStyle}
      title={isAutomatic ? 'Modo automático (sigue preferencia del sistema)' : `Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`}
      aria-label={isAutomatic ? 'Modo automático' : `Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`}
    >
      {getIcon()}
    </button>
  );
}

function PromoLanguageToggle() {
  const { language, setLanguage } = useLanguage();
  
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

  return (
    <button 
      onClick={cycleLanguage} 
      style={buttonBaseStyle}
      title={`Idioma: ${currentLang.name}. Haz clic para cambiar.`}
      aria-label={`Cambiar idioma. Actual: ${currentLang.name}`}
    >
      <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#8b5cf6' }}>
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
      
      <main>
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