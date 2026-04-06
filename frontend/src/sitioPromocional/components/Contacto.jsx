import React from 'react';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaWhatsapp, FaLocationArrow } from 'react-icons/fa';
import { CONFIG, CLINIC_ADDRESS, CLINIC_PHONE, CLINIC_EMAIL } from '../config/constants';

function Contacto() {
  const workingHours = CONFIG.workingHours || {};
  
  const formatWhatsApp = (phone) => {
    return phone.replace(/\s/g, '');
  };

  return (
    <section className="promo-contacto" id="contacto">
      <div className="promo-contacto-content">
        <div className="promo-contacto-info">
          <span className="promo-section-label">Contacto</span>
          <h2>Estamos aquí para ayudarte</h2>
          <p className="promo-contacto-desc">
            Contáctanos para cualquier consulta o Para agendar tu cita. Nuestro equipo te atenderá 
            con alegría y profesionalismo.
          </p>
          
          <div className="promo-contacto-details">
            <div className="promo-contacto-item">
              <div className="promo-contacto-icon">
                <FaMapMarkerAlt />
              </div>
              <div>
                <h4>Dirección</h4>
                <p>{CLINIC_ADDRESS}</p>
              </div>
            </div>
            
            <div className="promo-contacto-item">
              <div className="promo-contacto-icon">
                <FaPhone />
              </div>
              <div>
                <h4>Teléfono</h4>
                <p>{CLINIC_PHONE}</p>
              </div>
            </div>
            
            <div className="promo-contacto-item">
              <div className="promo-contacto-icon">
                <FaEnvelope />
              </div>
              <div>
                <h4>Email</h4>
                <p>{CLINIC_EMAIL}</p>
              </div>
            </div>
            
            <div className="promo-contacto-item">
              <div className="promo-contacto-icon">
                <FaWhatsapp />
              </div>
              <div>
                <h4>WhatsApp</h4>
                <p>
                  <a 
                    href={`https://wa.me/${formatWhatsApp(CLINIC_PHONE)}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: 'var(--promo-primary)', textDecoration: 'underline' }}
                  >
                    Chatea con nosotros
                  </a>
                </p>
              </div>
            </div>
            
            <div className="promo-contacto-item">
              <div className="promo-contacto-icon">
                <FaClock />
              </div>
              <div>
                <h4>Horario de Atención</h4>
                <p>Lunes - Viernes: 08:00 - 18:00</p>
                <p>Sábado: 09:00 - 14:00</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="promo-contacto-map">
          <div className="promo-mapa">
            <div className="promo-mapa-placeholder">
              <FaLocationArrow style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--promo-primary)' }} />
              <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Nuestra Ubicación</p>
              <p style={{ color: 'var(--text-muted)' }}>{CLINIC_ADDRESS}</p>
              <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.875rem' }}>
                (Mapa en desarrollo)
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Contacto;