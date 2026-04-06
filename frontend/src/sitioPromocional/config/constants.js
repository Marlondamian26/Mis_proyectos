export const CLINIC_NAME = 'Clínica Dra. Belkis Morejón Acosta';
export const CLINIC_LOCATION = 'Benfica, Luanda, Angola';
export const CLINIC_ADDRESS = 'Bemfica, Luanda, Angola';
export const CLINIC_PHONE = '+244 900 000 000';
export const CLINIC_EMAIL = 'contacto@clinicabelkis.co.ao';
export const CLINIC_WHATSAPP = '+244 900 000 000';

export const DOCTOR_NAME = 'Dra. Belkis Morejón Acosta';
export const DOCTOR_TITLE = 'Médica Especialista';
export const DOCTOR_SPECIALTY = 'Medicina General';

export const CONFIG = {
  name: CLINIC_NAME,
  doctorName: DOCTOR_NAME,
  doctorTitle: DOCTOR_TITLE,
  specialty: DOCTOR_SPECIALTY,
  location: CLINIC_LOCATION,
  address: CLINIC_ADDRESS,
  phone: CLINIC_PHONE,
  email: CLINIC_EMAIL,
  whatsapp: CLINIC_WHATSAPP,
  workingHours: {
    monday: '08:00 - 18:00',
    tuesday: '08:00 - 18:00',
    wednesday: '08:00 - 18:00',
    thursday: '08:00 - 18:00',
    friday: '08:00 - 18:00',
    saturday: '09:00 - 14:00',
    sunday: 'Cerrado'
  },
  services: [
    {
      id: 1,
      title: 'Consultas Médicas',
      description: 'Atención médica general y especializada para todas las edades.',
      icon: 'stethoscope'
    },
    {
      id: 2,
      title: 'Control de Salud',
      description: 'Chequeos prevents y seguimiento de condiciones crónicas.',
      icon: 'heart'
    },
    {
      id: 3,
      title: 'Atención de Emergencias',
      description: 'Servicio de atención médica urgente para casos prioritarios.',
      icon: 'emergency'
    },
    {
      id: 4,
      title: 'Vacunación',
      description: 'Programa completo de vacunaciónpara niños y adultos.',
      icon: 'syringe'
    },
    {
      id: 5,
      title: 'Análisis Clínicos',
      description: 'Tomas de muestras y exámenes de laboratorio.',
      icon: 'flask'
    },
    {
      id: 6,
      title: 'Certificados Médicos',
      description: 'Emisión de certificados de salud y aptitud física.',
      icon: 'document'
    }
  ],
  testimonials: [
    {
      id: 1,
      name: 'Maria João',
      text: 'Excelente atención. La Dra. Belkis es muy profesional y cálida con los pacientes.',
      rating: 5
    },
    {
      id: 2,
      name: 'Carlos Manuel',
      text: 'La clínica tiene un ambiente muy acogedor y el servicio es excelente.',
      rating: 5
    },
    {
      id: 3,
      name: 'Ana Paula',
      text: 'Muy recomendada. Siempre atenderon todas mis dudas con paciencia.',
      rating: 5
    }
  ]
};

export const PLATFORM_URL = '/login';
export const REGISTRO_URL = '/registro';