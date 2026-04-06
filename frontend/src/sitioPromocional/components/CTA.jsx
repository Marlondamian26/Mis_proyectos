import React from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarCheck, FaUserPlus, FaWhatsapp } from 'react-icons/fa';
import { PLATFORM_URL, REGISTRO_URL, CLINIC_PHONE } from '../config/constants';

function CTA() {
  const handleWhatsApp = () => {
    window.open(`https://wa.me/${CLINIC_PHONE.replace(/\s/g, '')}`, '_blank');
  };

  return (
    <section className="promo-cta">
      <div className="promo-cta-content">
        <h2>¿Listo para cuidar de tu salud?</h2>
        <p>
          Regístrate en nuestra plataforma para agendar tus citas, 
          acceder a tu historial médico y mucho más. Es rápido y fácil.
        </p>
        
        <div className="promo-cta-buttons">
          <Link to={REGISTRO_URL} className="promo-btn promo-btn-primary">
            <FaUserPlus />
            Registrarse Ahora
          </Link>
          <Link to={PLATFORM_URL} className="promo-btn promo-btn-secondary">
            <FaCalendarCheck />
            Iniciar Sesión
          </Link>
          <button className="promo-btn promo-btn-secondary" onClick={handleWhatsApp}>
            <FaWhatsapp />
            Chatear en WhatsApp
          </button>
        </div>
      </div>
    </section>
  );
}

export default CTA;