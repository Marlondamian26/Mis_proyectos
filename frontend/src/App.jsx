import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import './App.css';

// Context
import { ThemeProvider } from './context/ThemeContext';

// Components
import Login from './components/Login';
import Registro from './components/Registro';
import Dashboard from './components/Dashboard';
import Citas from './components/Citas';
import Doctores from './components/Doctores';
import Perfil from './components/Perfil';
import AdminDashboard from './components/AdminDashboard';
import EnfermeriaDashboard from './components/EnfermeriaDashboard';
import ThemeToggle from './components/ThemeToggle';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <ThemeToggle /> {/* Botón visible en todas las páginas */}
        <div className="App">
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
      </Router>
    </ThemeProvider>
  );
}

export default App;