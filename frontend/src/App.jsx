import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import './App.css';

// Context
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { NotificacionesProvider } from './context/NotificacionesContext';

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
import Footer from './components/Footer';  // <-- IMPORTAR FOOTER

const styles = {
  appContainer: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',  // Importante para que el footer se pegue abajo
  },
  contentContainer: {
    flex: 1,  // El contenido ocupa todo el espacio disponible
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

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificacionesProvider>
          <Router>
            <div style={styles.appContainer}>
              <div style={styles.headerBar}>
                <ThemeToggle />
                <NotificacionesCampana />
              </div>
              
              <div style={styles.contentContainer}>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/registro" element={<Registro />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/citas" element={<Citas />} />
                  <Route path="/doctores" element={<Doctores />} />
                  <Route path="/perfil" element={<Perfil />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/enfermeria" element={<EnfermeriaDashboard />} />
                  <Route path="/" element={<Navigate to="/login" />} />
                </Routes>
              </div>

              <Footer />  {/* <-- FOOTER SIEMPRE VISIBLE */}
            </div>
          </Router>
        </NotificacionesProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;