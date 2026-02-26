import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'

// Componentes
import Login from './components/Login'
import Registro from './components/Registro'
import Dashboard from './components/Dashboard'
import Citas from './components/Citas'
import Doctores from './components/Doctores'
import Perfil from './components/Perfil'  // <-- NUEVO

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          
          {/* Rutas protegidas */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/citas" element={<Citas />} />
          <Route path="/doctores" element={<Doctores />} />
          <Route path="/perfil" element={<Perfil />} />  {/* <-- NUEVA RUTA */}
          
          {/* Ruta por defecto */}
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App