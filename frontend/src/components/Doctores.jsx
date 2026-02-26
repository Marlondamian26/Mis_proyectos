import React from 'react'
import { Link } from 'react-router-dom'

function Doctores() {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Lista de Doctores</h1>
      <p>En construcción</p>
      <Link to="/dashboard">Volver al Dashboard</Link>
    </div>
  )
}

export default Doctores