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
  const [isAutomatic, setIsAutomatic] = useState(true); // Modo automático: sigue la preferencia del navegador

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

  // Detectar preferencia del sistema al cargar
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const savedAutomatic = localStorage.getItem('theme-automatic');
    
    if (savedAutomatic === 'false') {
      // El usuario ha elegido un tema manual
      setIsAutomatic(false);
      if (savedTheme) {
        setTheme(savedTheme);
      }
    } else {
      // Modo automático: usar preferencia del navegador
      setIsAutomatic(true);
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);

  // Aplicar tema al elemento html
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (!isAutomatic) {
      localStorage.setItem('theme', theme);
    }
    localStorage.setItem('theme-automatic', isAutomatic);
    // Disparar un evento personalizado para que otros componentes puedan reaccionar
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme, isAutomatic } }));
  }, [theme, isAutomatic]);

  // Escuchar cambios en la preferencia del sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      // Si está en modo automático, actualizar el tema
      if (isAutomatic) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [isAutomatic]);

  const toggleTheme = useCallback(() => {
    if (isAutomatic) {
      // Al hacer toggle, cambiar a modo manual
      setIsAutomatic(false);
      setIsTransitioning(true);
      setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
    } else {
      // Si ya está en modo manual, solo cambiar el tema
      setIsTransitioning(true);
      setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
    }
  }, [isAutomatic]);

  const setThemeManually = useCallback((newTheme) => {
    setIsAutomatic(false);
    setIsTransitioning(true);
    setTheme(newTheme);
  }, []);

  const setThemeAutomatic = useCallback(() => {
    setIsAutomatic(true);
    setIsTransitioning(true);
    // Aplicar la preferencia actual del navegador
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(prefersDark ? 'dark' : 'light');
  }, []);

  return (
    <ThemeContext.Provider value={{
      theme,
      toggleTheme,
      setThemeManually,
      setThemeAutomatic,
      isTransitioning,
      isAutomatic
    }}>
      {children}
    </ThemeContext.Provider>
  );
};