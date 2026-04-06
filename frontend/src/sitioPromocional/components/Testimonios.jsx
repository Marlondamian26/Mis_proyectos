import React from 'react';
import { FaStar } from 'react-icons/fa';
import { CONFIG } from '../config/constants';

function Testimonios() {
  const testimonials = CONFIG.testimonials || [];

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <section className="promo-testimonios" id="testimonios">
      <div className="promo-section-header">
        <span className="promo-section-label">Testimonios</span>
        <h2 className="promo-section-title">Lo que dicen nuestros pacientes</h2>
        <p className="promo-section-subtitle">
          La satisfacción y bienestar de nuestros pacientes es nuestro mejor recompensa.
        </p>
      </div>
      
      <div className="promo-testimonios-grid">
        {testimonials.map((testimonio) => (
          <div key={testimonio.id} className="promo-testimonio-card">
            <div className="promo-testimonio-stars">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} className="promo-testimonio-star" />
              ))}
            </div>
            <p className="promo-testimonio-text">"{testimonio.text}"</p>
            <div className="promo-testimonio-author">
              <div className="promo-testimonio-avatar">
                {getInitials(testimonio.name)}
              </div>
              <div>
                <div className="promo-testimonio-name">{testimonio.name}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Testimonios;