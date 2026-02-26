import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'

// Componentes (los crearemos después)
import Login from './components/Login'
import Registro from './components/Registro'
import Dashboard from './components/Dashboard'
import Citas from './components/Citas'
import Doctores from './components/Doctores'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          
          {/* Rutas protegidas (requieren token) */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/citas" element={<Citas />} />
          <Route path="/doctores" element={<Doctores />} />
          
          {/* Ruta por defecto */}
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App