import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaGlobe, FaHome } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';

const PromocionalToggle = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  
  const isPromocional = location.pathname === '/' || location.pathname === '/promocional';

  const handleClick = () => {
    if (isPromocional) {
      navigate('/dashboard');
    } else {
      navigate('/promocional');
    }
  };

  return (
    <button 
      onClick={handleClick}
      style={styles.button}
      title={isPromocional ? t('backToDashboard') : 'Ver sitio web promocional'}
      aria-label={isPromocional ? t('backToDashboard') : 'Ver sitio web promocional'}
    >
      <span style={styles.icon}>
        <FaHome />
      </span>
    </button>
  );
};

const styles = {
  button: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--bg-secondary)',
    border: '2px solid var(--border-color)',
    borderRadius: '50%',
    width: '55px',
    height: '55px',
    cursor: 'pointer',
    color: 'var(--text-primary)',
    transition: 'all 0.3s ease',
    boxShadow: 'var(--box-shadow)',
  },
  icon: {
    fontSize: '20px',
    color: '#8b5cf6',
  },
};

export default PromocionalToggle;