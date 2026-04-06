import React from 'react';
import { FaStethoscope, FaHeart, FaAmbulance, FaSyringe, FaFlask, FaFileMedical, FaCheck } from 'react-icons/fa';
import { CONFIG } from '../config/constants';

const iconMap = {
  stethoscope: FaStethoscope,
  heart: FaHeart,
  emergency: FaAmbulance,
  syringe: FaSyringe,
  flask: FaFlask,
  document: FaFileMedical
};

function Servicios() {
  const servicios = CONFIG.services || [];

  return (
    <section className="promo-servicios" id="servicios">
      <div className="promo-section-header">
        <span className="promo-section-label">Nuestros Servicios</span>
        <h2 className="promo-section-title">Atención Médica Integral</h2>
        <p className="promo-section-subtitle">
          Ofrecemos una amplia gama de servicios médicos para cuidar de tu salud 
          y la de tu familia con los más altos estándares de calidad.
        </p>
      </div>
      
      <div className="promo-servicios-grid">
        {servicios.map((servicio) => {
          const IconComponent = iconMap[servicio.icon] || FaStethoscope;
          
          return (
            <div key={servicio.id} className="promo-servicio-card">
              <div className="promo-servicio-icon">
                <IconComponent />
              </div>
              <h3>{servicio.title}</h3>
              <p>{servicio.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default Servicios;