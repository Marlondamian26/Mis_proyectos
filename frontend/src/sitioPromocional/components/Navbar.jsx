import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaStethoscope, FaBars, FaTimes, FaHome, FaStethoscope as FaServicios, FaInfoCircle, FaComments, FaPhone, FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import { CLINIC_NAME, PLATFORM_URL, REGISTRO_URL } from '../config/constants';

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#inicio', label: 'Inicio', icon: FaHome },
    { href: '#servicios', label: 'Servicios', icon: FaServicios },
    { href: '#sobre-nosotros', label: 'Nosotros', icon: FaInfoCircle },
    { href: '#testimonios', label: 'Testimonios', icon: FaComments },
    { href: '#contacto', label: 'Contacto', icon: FaPhone }
  ];

  return (
    <nav 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: isScrolled ? 'var(--bg-secondary)' : 'transparent',
        boxShadow: isScrolled ? '0 2px 20px rgba(0,0,0,0.1)' : 'none',
        transition: 'all 0.3s ease'
      }}
    >
      <div 
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '1rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Link 
          to="/" 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            textDecoration: 'none',
            color: 'var(--text-primary)',
            fontWeight: 700,
            fontSize: '1.25rem'
          }}
        >
          <div 
            style={{
              width: '40px',
              height: '40px',
              background: 'var(--promo-gradient)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '1.25rem'
            }}
          >
            <FaStethoscope />
          </div>
          <span style={{ display: 'none', '@media (min-width: 768px)': { display: 'block' } }}>
            {CLINIC_NAME}
          </span>
        </Link>

        <div 
          style={{
            display: 'flex',
            gap: '2rem',
            alignItems: 'center'
          }}
          className="promo-desktop-nav"
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              style={{
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                fontWeight: 500,
                fontSize: '0.95rem',
                transition: 'color 0.2s ease'
              }}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div 
          style={{
            display: 'flex',
            gap: '1rem',
            alignItems: 'center'
          }}
          className="promo-desktop-auth"
        >
          <Link
            to={PLATFORM_URL}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              textDecoration: 'none',
              color: 'var(--text-secondary)',
              fontWeight: 500,
              fontSize: '0.95rem',
              transition: 'all 0.2s ease'
            }}
          >
            <FaSignInAlt />
            Iniciar Sesión
          </Link>
          <Link
            to={REGISTRO_URL}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1.25rem',
              borderRadius: '8px',
              background: 'var(--promo-gradient)',
              color: 'white',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
              transition: 'all 0.2s ease'
            }}
          >
            <FaUserPlus />
            Registrarse
          </Link>
        </div>

        <button
          className="promo-mobile-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: 'var(--text-primary)'
          }}
        >
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div 
          className="promo-mobile-menu"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'var(--bg-secondary)',
            padding: '1rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                borderRadius: '8px',
                transition: 'background 0.2s ease'
              }}
            >
              <link.icon />
              {link.label}
            </a>
          ))}
          <hr style={{ margin: '0.5rem 0', border: 'none', borderTop: '1px solid var(--border-color)' }} />
          <Link
            to={PLATFORM_URL}
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              borderRadius: '8px'
            }}
          >
            <FaSignInAlt />
            Iniciar Sesión
          </Link>
          <Link
            to={REGISTRO_URL}
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              color: 'white',
              background: 'var(--promo-gradient)',
              textDecoration: 'none',
              borderRadius: '8px',
              marginTop: '0.5rem'
            }}
          >
            <FaUserPlus />
            Registrarse
          </Link>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .promo-desktop-nav, .promo-desktop-auth {
            display: none !important;
          }
          .promo-mobile-toggle {
            display: block !important;
          }
        }
      `}</style>
    </nav>
  );
}

export default Navbar;