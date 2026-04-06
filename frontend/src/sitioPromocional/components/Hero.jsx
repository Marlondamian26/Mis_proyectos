import React from 'react';
import { Link } from 'react-router-dom';
import { FaStethoscope, FaHeart, FaMapMarkerAlt, FaArrowRight, FaWhatsapp } from 'react-icons/fa';
import { DOCTOR_NAME, DOCTOR_SPECIALTY, CLINIC_LOCATION, CLINIC_PHONE, PLATFORM_URL, REGISTRO_URL } from '../config/constants';

function Hero() {
  const handleWhatsApp = () => {
    window.open(`https://wa.me/${CLINIC_PHONE.replace(/\s/g, '')}`, '_blank');
  };

  return (
    <section className="promo-hero">
      <div className="promo-hero-content">
        <div className="promo-hero-text">
          <div className="promo-hero-badge">
            <span>Atención Médica de Calidad</span>
          </div>
          
          <h1>
            Cuidamos de tu salud con profesionalismo y dedicación
          </h1>
          
          <p className="promo-hero-subtitle">
            En nuestra clínica encontrarás una atención médica integral, personalizada y-humana. 
            Tu bienestar y el de tu familia son nuestra máxima prioridad.
          </p>
          
          <div className="promo-hero-buttons">
            <Link to={PLATFORM_URL} className="promo-btn promo-btn-primary">
              <FaStethoscope />
              Iniciar Sesión
            </Link>
            <Link to={REGISTRO_URL} className="promo-btn promo-btn-secondary">
              <FaArrowRight />
              Registrarse
            </Link>
            <button className="promo-btn promo-btn-secondary" onClick={handleWhatsApp}>
              <FaWhatsapp />
              WhatsApp
            </button>
          </div>
        </div>
        
        <div className="promo-hero-image">
          <div className="promo-hero-card">
            <div className="promo-hero-doctor">
              <div className="promo-doctor-avatar">
                <FaStethoscope />
              </div>
              <div className="promo-doctor-info">
                <h3>{DOCTOR_NAME}</h3>
                <p className="promo-doctor-specialty">{DOCTOR_SPECIALTY}</p>
                <p className="promo-doctor-location">
                  <FaMapMarkerAlt />
                  {CLINIC_LOCATION}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;