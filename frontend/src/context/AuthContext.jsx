import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../services/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      cargarUsuario();
    } else {
      setLoading(false);
    }
  }, []);

  const cargarUsuario = async () => {
    try {
      const response = await axiosInstance.get('usuario-actual/');
      setUser(response.data);
    } catch (error) {
      console.error('Error cargando usuario:', error);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    // Implementar login
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, cargarUsuario }}>
      {children}
    </AuthContext.Provider>
  );
};