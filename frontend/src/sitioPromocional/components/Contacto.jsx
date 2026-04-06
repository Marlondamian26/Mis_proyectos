import React from 'react';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock } from 'react-icons/fa';
import { CONFIG } from '../config/constants';

function Contacto() {
  const contactInfo = CONFIG.contact;

  return (
    <section className="promo-contacto" id="contacto">
      <div className="promo-section-header">
        <span className="promo-section-label">{contactInfo.title}</span>
        <h2 className="promo-section-title">Estamos listos para atenderte</h2>
        <p className="promo-section-subtitle">
          {contactInfo.subtitle}
        </p>
      </div>

      <div className="promo-contacto-grid">
        <div className="promo-contacto-card">
          <div className="promo-contacto-icon">
            <FaMapMarkerAlt />
          </div>
          <h3>Dirección</h3>
          <p>{contactInfo.address}</p>
        </div>

        <div className="promo-contacto-card">
          <div className="promo-contacto-icon">
            <FaPhone />
          </div>
          <h3>Teléfono</h3>
          <p>{contactInfo.phone}</p>
        </div>

        <div className="promo-contacto-card">
          <div className="promo-contacto-icon">
            <FaEnvelope />
          </div>
          <h3>Email</h3>
          <p>{contactInfo.email}</p>
        </div>

        <div className="promo-contacto-card">
          <div className="promo-contacto-icon">
            <FaClock />
          </div>
          <h3>Horario</h3>
          <p>{contactInfo.hours}</p>
        </div>
      </div>
    </section>
  );
}

export default Contacto;