import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { FaHeart, FaCode } from 'react-icons/fa';

const Footer = () => {
  const { theme } = useTheme();
  const currentYear = new Date().getFullYear();

  const styles = {
    footer: {
      backgroundColor: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border-color)',
      padding: '20px 0',
      marginTop: 'auto',
      width: '100%',
      fontSize: '14px',
      color: 'var(--text-muted)',
      textAlign: 'center',
      transition: 'all 0.3s ease',
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 20px',
    },
    content: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '5px',
    },
    text: {
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
      flexWrap: 'wrap',
      justifyContent: 'center',
    },
    heart: {
      color: '#e74c3c',
      animation: 'pulse 1.5s ease infinite',
      margin: '0 3px',
    },
    code: {
      color: 'var(--color-admin)',
      margin: '0 3px',
    },
    link: {
      color: 'var(--color-patient)',
      textDecoration: 'none',
      transition: 'color 0.3s ease',
      ':hover': {
        color: 'var(--color-admin)',
        textDecoration: 'underline',
      },
    },
    small: {
      fontSize: '12px',
      color: 'var(--text-muted)',
      opacity: 0.8,
    },
  };

  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.content}>
          <p style={styles.small}>
            Versión 1.0.0 | Sistema de gestión médica para consultorios y clínicas.
          </p>
        </div>
      </div>
    </footer>
  );
};

// Añadir animación de pulso para el corazón
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
  }
`;
document.head.appendChild(styleSheet);

export default Footer;