// src/context/ThemeContext.jsx
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe usarse dentro de ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Efecto para añadir/remover clase de transición al body
  useEffect(() => {
    if (isTransitioning) {
      document.body.classList.add('theme-transition');
      const timer = setTimeout(() => {
        document.body.classList.remove('theme-transition');
        setIsTransitioning(false);
      }, 300); // Duración de la transición
      return () => clearTimeout(timer);
    }
  }, [isTransitioning]);

  // Detectar preferencia del sistema
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);

  // Aplicar tema al elemento html
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    // Disparar un evento personalizado para que otros componentes puedan reaccionar
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
  }, [theme]);

  // Escuchar cambios en la preferencia del sistema (si no hay preferencia guardada)
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = useCallback(() => {
    setIsTransitioning(true);
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const setThemeManually = useCallback((newTheme) => {
    setIsTransitioning(true);
    setTheme(newTheme);
  }, []);

  return (
    <ThemeContext.Provider value={{
      theme,
      toggleTheme,
      setThemeManually,
      isTransitioning
    }}>
      {children}
    </ThemeContext.Provider>
  );
};