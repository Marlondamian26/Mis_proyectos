import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function Dashboard() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('access_token')
      
      if (!token) {
        navigate('/login')
        return
      }

      try {
        const response = await axios.get('http://127.0.0.1:8000/api/usuario-actual/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        setUser(response.data)
      } catch (err) {
        console.error('Error obteniendo usuario:', err)
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        navigate('/login')
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    navigate('/login')
  }

  if (loading) {
    return <div style={styles.loading}>Cargando...</div>
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Bienvenido, {user?.first_name} {user?.last_name}</h1>
        <button onClick={handleLogout} style={styles.logoutButton}>
          Cerrar Sesión
        </button>
      </div>
      
      <div style={styles.content}>
        <div style={styles.card}>
          <h3>Información de Usuario</h3>
          <p><strong>Usuario:</strong> {user?.username}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Rol:</strong> {user?.rol}</p>
          <p><strong>Teléfono:</strong> {user?.telefono}</p>
        </div>

        <div style={styles.menu}>
          <h3>Menú Principal</h3>
          <div style={styles.menuGrid}>
            <div style={styles.menuItem} onClick={() => navigate('/citas')}>
              📅 Mis Citas
            </div>
            <div style={styles.menuItem} onClick={() => navigate('/doctores')}>
              👨‍⚕️ Doctores
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  content: {
    display: 'grid',
    gap: '20px'
  },
  card: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  menu: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  menuGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
    marginTop: '15px'
  },
  menuItem: {
    backgroundColor: '#f8f9fa',
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'transform 0.2s',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }
  },
  loading: {
    textAlign: 'center',
    fontSize: '20px',
    marginTop: '50px'
  }
}

export default Dashboard