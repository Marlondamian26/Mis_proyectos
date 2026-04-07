import React from 'react';
import { FaStethoscope, FaHeart, FaAmbulance, FaSyringe, FaFlask, FaFileMedical, FaCheck } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';
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
  const { language } = useLanguage();
  const servicios = CONFIG.services || [];

  const t = (key) => {
    const translations = {
      pt: {
        servicesTitle: 'Nossos Servicos',
        servicesSubtitle: 'Oferecemos uma ampla gama de servicos medicos para cuidar da sua saude e da sua familia com os mais altos padroes de qualidade.',
        serviceList: [
          { title: 'Consulta Medica Geral', description: 'Atencao integral para todas as idades. Diagnostico, tratamento e acompanhamento de doencas comuns.' },
          { title: 'Cardiologia', description: 'Avaliacao e tratamento de doencas do coracao e sistema cardiovascular.' },
          { title: 'Atencao de Emergencias', description: 'Servico de urgencias medicas disponivel para casos que requerem atencao imediata.' },
          { title: 'Vacinacao', description: 'Programa de vacinacao para adultos e criancas. Todas as vacinas do esquema nacional.' },
          { title: 'Analises Clinicas', description: 'Servico de laboratorio para exames de sangue, urina e outros analises diagnosticos.' },
          { title: 'Certificados Medicos', description: 'Emitimos certificados medicos para trabalho, escola, trâmites administrativos e mais.' }
        ]
      },
      es: {
        servicesTitle: 'Nuestros Servicios',
        servicesSubtitle: 'Ofrecemos una amplia gama de servicios medicos para cuidar de tu salud y la de tu familia con los mas altos estandares de calidad.',
        serviceList: [
          { title: 'Consulta Medica General', description: 'Atencion integral para todas las edades. Diagnostico, tratamiento y seguimiento de enfermedades comunes.' },
          { title: 'Cardiologia', description: 'Evaluacion y tratamiento de enfermedades del corazon y sistema cardiovascular.' },
          { title: 'Atencion de Emergencias', description: 'Servicio de urgencias medicas disponible para casos que requieren atencion inmediata.' },
          { title: 'Vacunacion', description: 'Programa de vaccinacion para adultos y ninos. Todas las vacunas del esquema nacional.' },
          { title: 'Analisis Clinicos', description: 'Servicio de laboratorio para examenes de sangre, orina y otros analisis diagnosticos.' },
          { title: 'Certificados Medicos', description: 'Emitimos certificados medicos para trabajo, escuela, tramites administrativos y mas.' }
        ]
      },
      en: {
        servicesTitle: 'Our Services',
        servicesSubtitle: 'We offer a wide range of medical services to take care of your health and your family with the highest quality standards.',
        serviceList: [
          { title: 'General Medical Consultation', description: 'Comprehensive care for all ages. Diagnosis, treatment and follow-up of common diseases.' },
          { title: 'Cardiology', description: 'Evaluation and treatment of heart and cardiovascular system diseases.' },
          { title: 'Emergency Care', description: 'Emergency medical service available for cases requiring immediate attention.' },
          { title: 'Vaccination', description: 'Vaccination program for adults and children. All vaccines from the national schedule.' },
          { title: 'Clinical Analysis', description: 'Laboratory service for blood, urine and other diagnostic tests.' },
          { title: 'Medical Certificates', description: 'We issue medical certificates for work, school, administrative procedures and more.' }
        ]
      }
    };
    return translations[language]?.[key] || translations.es[key] || key;
  };

  const serviceList = t('serviceList');

  return (
    <section className="promo-servicios" id="servicios">
      <div className="promo-section-header">
        <span className="promo-section-label">{t('servicesTitle')}</span>
        <h2 className="promo-section-title">Atencion Medica Integral</h2>
        <p className="promo-section-subtitle">
          {t('servicesSubtitle')}
        </p>
      </div>
      
      <div className="promo-servicios-grid">
        {servicios.map((servicio, index) => {
          const IconComponent = iconMap[servicio.icon] || FaStethoscope;
          const translatedService = serviceList[index] || servicio;
          
          return (
            <div key={servicio.id} className="promo-servicio-card">
              <div className="promo-servicio-icon">
                <IconComponent />
              </div>
              <h3>{translatedService.title}</h3>
              <p>{translatedService.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default Servicios;