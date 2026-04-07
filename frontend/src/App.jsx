import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './index.css';
import './App.css';

// Context
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { NotificacionesProvider } from './context/NotificacionesContext';
import { LanguageProvider } from './context/LanguageContext';

// Components
import Login from './components/Login';
import Registro from './components/Registro';
import Dashboard from './components/Dashboard';
import Citas from './components/Citas';
import Doctores from './components/Doctores';
import Perfil from './components/Perfil';
import AdminDashboard from './components/AdminDashboard';
import EnfermeriaDashboard from './components/EnfermeriaDashboard';
import NotificacionesCampana from './components/NotificacionesCampana';
import ThemeToggle from './components/ThemeToggle';
import LanguageToggle from './components/LanguageToggle';
import Footer from './components/Footer';
import { APP_NAME } from './config/constants';

// Sitio Promocional Components
import SitioPromocionalLanding from './sitioPromocional/components/LandingWrapper';

const styles = {
  appContainer: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
  },
  contentContainer: {
    flex: 1,
  },
  headerBar: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    alignItems: 'flex-end',
  },
};

function HeaderBar({ isPromocional }) {
  if (isPromocional) {
    return null;
  }
  
  return (
    <div style={styles.headerBar}>
      <ThemeToggle />
      <LanguageToggle />
      <NotificacionesCampana />
    </div>
  );
}

function AppContent() {
  const location = useLocation();
  const isPromocional = location.pathname === '/' || location.pathname === '/promocional';
  
  return (
    <div style={styles.appContainer}>
      <HeaderBar isPromocional={isPromocional} />
      
      <div style={styles.contentContainer}>
        <Routes>
          <Route path="/promocional" element={<SitioPromocionalLanding />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/citas" element={<Citas />} />
          <Route path="/doctores" element={<Doctores />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/enfermeria" element={<EnfermeriaDashboard />} />
          <Route path="/" element={<SitioPromocionalLanding />} />
        </Routes>
      </div>

      <Footer />
    </div>
  );
}

function App() {

  return (
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
          <NotificacionesProvider>
            <Router>
              <AppContent />
            </Router>
          </NotificacionesProvider>
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;
