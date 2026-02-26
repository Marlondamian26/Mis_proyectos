import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [mensaje, setMensaje] = useState('Cargando...')

  useEffect(() => {
    // Llama al backend
    axios.get('http://localhost:8000/api/health/')
      .then(response => {
        setMensaje(response.data.message)
      })
      .catch(error => {
        setMensaje('Error conectando con el backend: ' + error.message)
      })
  }, [])

  return (
    <div className="App">
      <h1>Belkis-saúde</h1>
      <p>Mensaje del backend: <strong>{mensaje}</strong></p>
    </div>
  )
}

export default App