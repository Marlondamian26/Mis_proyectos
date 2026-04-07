import React, { useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { FaSun, FaMoon, FaAdjust, FaGlobe } from 'react-icons/fa';
import '../styles/promocional.css';

import Navbar from './Navbar';
import Hero from './Hero';
import Servicios from './Servicios';
import SobreNosotros from './SobreNosotros';
import Testimonios from './Testimonios';
import Contacto from './Contacto';
import CTA from './CTA';
import Footer from './Footer';

const themeToggleStyles = {
  position: 'fixed',
  top: '20px',
  right: '20px',
  zIndex: 1000,
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
};

const buttonStyle = {
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
};

const langButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'var(--bg-secondary)',
  border: '2px solid var(--border-color)',
  borderRadius: '50%',
  width: '55px',
  height: '55px',
  cursor: 'pointer',
  color: 'var(--text-primary)',
  transition: 'all 0.3s ease',
  boxShadow: 'var(--box-shadow)',
};

function ThemeToggle() {
  const { theme, toggleTheme, isAutomatic } = useTheme();
  
  return (
    <button onClick={toggleTheme} style={buttonStyle} title={isAutomatic ? 'Modo automatico' : `Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`}>
      {isAutomatic ? (
        <FaAdjust style={{ fontSize: '24px', color: '#8b5cf6' }} />
      ) : theme === 'light' ? (
        <FaMoon style={{ fontSize: '24px', color: '#3b82f6' }} />
      ) : (
        <FaSun style={{ fontSize: '24px', color: '#fbbf24' }} />
      )}
    </button>
  );
}

function LanguageToggle() {
  const { language, setLanguage } = useLanguage();
  
  const languages = [
    { code: 'pt', name: 'Portugues', flag: 'PT' },
    { code: 'es', name: 'Espanol', flag: 'ES' },
    { code: 'en', name: 'English', flag: 'EN' }
  ];

  const cycleLanguage = () => {
    const currentIndex = languages.findIndex(l => l.code === language);
    const nextIndex = (currentIndex + 1) % languages.length;
    setLanguage(languages[nextIndex].code);
  };

  const currentLang = languages.find(l => l.code === language) || languages[0];

  return (
    <button onClick={cycleLanguage} style={langButtonStyle} title="Cambiar idioma">
      <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#8b5cf6' }}>{currentLang.flag}</span>
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
      <div style={themeToggleStyles}>
        <ThemeToggle />
        <LanguageToggle />
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