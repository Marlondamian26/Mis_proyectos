import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import './ChatIA.css';
import { useLanguage } from '../context/LanguageContext';

const getApiUrl = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const envUrl = import.meta.env.VITE_API_URL;
    if (envUrl) return envUrl;
  }
  const port = window.location.port ? `:${window.location.port}` : '';
  return `${window.location.protocol}//${window.location.hostname}${port}/api`;
};

const API_URL = getApiUrl();

const ChatIA = ({ token, onClose }) => {
  const { t, language } = useLanguage();
  const chatEndRef = useRef(null);
  
  const [estado, setEstado] = useState('inicio');
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [historial, setHistorial] = useState([]);
  const [opciones, setOpciones] = useState([]);
  const [datos, setDatos] = useState({
    especialidad: null,
    doctor: null,
    fecha: null,
    hora: null
  });
  
  const [especialidades, setEspecialidades] = useState([]);
  const [doctores, setDoctores] = useState([]);
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);
  const messageIdRef = useRef(0);
  
  const axiosInstance = useRef(axios.create({
    baseURL: API_URL,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }));

  const inicializar = useCallback(async (resetChat = false) => {
    if (resetChat) {
      setHistorial([]);
      setEstado('inicio');
      setDatos({ especialidad: null, doctor: null, fecha: null, hora: null });
      messageIdRef.current = 0;
    }
    setLoading(true);
    try {
      const espResponse = await axiosInstance.current.get('especialidades-publicas/');
      const espData = Array.isArray(espResponse.data) ? espResponse.data : (espResponse.data.results || []);
      setEspecialidades(espData);
      
      const docResponse = await axiosInstance.current.get('doctores-publicos/');
      const docData = Array.isArray(docResponse.data) ? docResponse.data : (docResponse.data.results || []);
      setDoctores(docData);
      
      setOpciones([
        { id: 'agendar', texto: t('scheduleAppointment') },
        { id: 'mis_citas', texto: t('myAppointments') },
        { id: 'ayuda', texto: t('needHelp') }
      ]);
    } catch (error) {
      console.error('Error inicializando:', error);
    } finally {
      setLoading(false);
    }
  }, [t]);

  const previousLanguageRef = useRef(language);
  
  useEffect(() => {
    if (previousLanguageRef.current !== language) {
      previousLanguageRef.current = language;
      inicializar(true);
    }
  }, [language, inicializar]);

  useEffect(() => {
    if (historial.length === 0 && opciones.length === 0) {
      inicializar(false);
    }
  }, [inicializar]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [historial]);

  const agregarMensaje = useCallback((texto, tipo = 'ia') => {
    messageIdRef.current += 1;
    const newId = messageIdRef.current;
    setHistorial(prev => [...prev, { id: newId, tipo, texto, timestamp: new Date() }]);
  }, []);

  const seleccionarOpcion = async (opcionId) => {
    agregarMensaje(opciones.find(o => o.id === opcionId)?.texto || opcionId, 'usuario');
    setLoading(true);

    try {
      switch (opcionId) {
        case 'agendar':
          if (especialidades.length === 0) {
            agregarMensaje(t('noDataAvailable') || 'Lo siento, no hay especialidades disponibles en este momento.');
            setEstado('inicio');
            setOpciones([
              { id: 'agendar', texto: t('scheduleAppointment') },
              { id: 'mis_citas', texto: t('myAppointments') }
            ]);
          } else {
            agregarMensaje(t('whatSpecialty'));
            setEstado('elegir_especialidad');
            setOpciones(especialidades.map(esp => ({
              id: esp.id,
              texto: esp.nombre
            })));
            if (especialidades.length > 0) {
              agregarMensaje(t('selectSpecialtyOption'), 'ia');
            }
          }
          break;

        case 'elegir_especialidad':
          const espSeleccionada = especialidades.find(e => e.id === parseInt(opcionId));
          if (espSeleccionada) {
            setDatos(prev => ({ ...prev, especialidad: espSeleccionada }));
            
            const doctoresFiltrados = doctores.filter(d => 
              d.especialidad === espSeleccionada.id || 
              d.especialidad_nombre === espSeleccionada.nombre
            );
            
            if (doctoresFiltrados.length === 0) {
              agregarMensaje(`${t('noDoctorsAvailable')} ${espSeleccionada.nombre}.`);
              agregarMensaje(t('chooseSpecialty'));
              setEstado('elegir_especialidad');
              setOpciones(especialidades.map(esp => ({
                id: esp.id,
                texto: esp.nombre
              })));
            } else {
              agregarMensaje(t('whichDoctor'));
              setEstado('elegir_doctor');
              setOpciones(doctoresFiltrados.map(d => ({
                id: d.id,
                texto: `Dr. ${d.usuario?.first_name} ${d.usuario?.last_name} - ${d.especialidad_nombre || d.otra_especialidad}`
              })));
            }
          }
          break;

        case 'elegir_doctor':
          const doctorSeleccionado = doctores.find(d => d.id === parseInt(opcionId));
          if (doctorSeleccionado) {
            setDatos(prev => ({ ...prev, doctor: doctorSeleccionado }));
            agregarMensaje(t('whatDate'));
            setEstado('elegir_fecha');
            setOpciones([
              { id: 'hoy', texto: t('today') },
              { id: 'manana', texto: t('tomorrow') },
              { id: 'otra', texto: t('otherDate') }
            ]);
          }
          break;

        case 'elegir_fecha':
          if (opcionId === 'hoy') {
            const hoy = new Date().toISOString().split('T')[0];
            setDatos(prev => ({ ...prev, fecha: hoy }));
            await cargarHorarios(datos.doctor?.id, hoy);
          } else if (opcionId === 'manana') {
            const manana = new Date(Date.now() + 86400000).toISOString().split('T')[0];
            setDatos(prev => ({ ...prev, fecha: manana }));
            await cargarHorarios(datos.doctor?.id, manana);
          } else {
            agregarMensaje(t('otherDate') + ' (YYYY-MM-DD)');
            setEstado('esperando_fecha');
          }
          break;

        case 'esperando_fecha':
          const fechaValida = opcionId;
          if (/^\d{4}-\d{2}-\d{2}$/.test(fechaValida)) {
            setDatos(prev => ({ ...prev, fecha: fechaValida }));
            await cargarHorarios(datos.doctor?.id, fechaValida);
          } else {
            agregarMensaje(t('invalidDateFormat'));
          }
          break;

        case 'elegir_hora':
          const horaSeleccionada = horariosDisponibles.find(h => h === opcionId);
          if (horaSeleccionada) {
            setDatos(prev => ({ ...prev, hora: horaSeleccionada }));
            await confirmarCita();
          }
          break;

        case 'confirmar':
          if (datos.especialidad && datos.doctor && datos.fecha && datos.hora) {
            await crearCita();
          } else {
            agregarMensaje(t('missingData'));
            setEstado('inicio');
            setDatos({ especialidad: null, doctor: null, fecha: null, hora: null });
            setOpciones([
              { id: 'agendar', texto: t('scheduleAppointment') },
              { id: 'mis_citas', texto: t('myAppointments') }
            ]);
          }
          break;

        case 'cancelar':
          agregarMensaje(t('understood'));
          setEstado('inicio');
          setDatos({ especialidad: null, doctor: null, fecha: null, hora: null });
          setOpciones([
            { id: 'agendar', texto: t('scheduleAppointment') },
            { id: 'mis_citas', texto: t('myAppointments') }
          ]);
          break;

        case 'mis_citas':
          setLoading(true);
          try {
            const misCitasResponse = await axiosInstance.current.get('mis-citas/');
            const misCitas = Array.isArray(misCitasResponse.data) ? misCitasResponse.data : (misCitasResponse.data.results || []);
            
            if (misCitas.length === 0) {
              agregarMensaje(t('noAppointments'));
            } else {
              agregarMensaje(t('yourAppointments'), 'ia');
              misCitas.forEach(cita => {
                agregarMensaje(
                  `- ${cita.fecha} a las ${cita.hora} con Dr. ${cita.doctor_nombre} (${cita.estado})`,
                  'ia'
                );
              });
            }
          } catch (error) {
            console.error('Error cargando citas:', error);
            agregarMensaje(t('errorLoadingAppointments'));
          }
          setEstado('inicio');
          setOpciones([
            { id: 'agendar', texto: t('scheduleAppointment') },
            { id: 'ayuda', texto: t('needHelp') }
          ]);
          break;

        case 'ayuda':
          agregarMensaje(t('howCanHelp'));
          setOpciones([
            { id: 'info', texto: t('clinicInfo') },
            { id: 'contacto', texto: t('contactSupport') },
            { id: 'volver', texto: t('backToMain') }
          ]);
          setEstado('ayuda');
          break;

        default:
          if (estado === 'elegir_especialidad') {
            const esp = especialidades.find(e => 
              e.nombre.toLowerCase().includes(opcionId.toLowerCase())
            );
            if (esp) {
              await seleccionarOpcion(esp.id);
            }
          }
          break;
      }
    } catch (error) {
      console.error('Error:', error);
      agregarMensaje(t('loadingError'));
    } finally {
      setLoading(false);
    }
  };

  const cargarHorarios = async (doctorId, fecha) => {
    setLoading(true);
    try {
      const response = await axiosInstance.current.get(`horarios/disponibles/?doctor=${doctorId}&fecha=${fecha}`);
      
      const citasResponse = await axiosInstance.current.get('citas/', {
        params: { doctor: doctorId, fecha }
      });
      const citasOcupadas = Array.isArray(citasResponse.data) ? citasResponse.data : (citasResponse.data.results || []);
      const horasOcupadas = citasOcupadas.map(c => c.hora);

      const slots = [];
      horariosData.forEach(horario => {
        if (!horario.activo) return;
        
        const [horaInicio, minInicio] = horario.hora_inicio.split(':').map(Number);
        const [horaFin, minFin] = horario.hora_fin.split(':').map(Number);
        
        let horaActual = new Date();
        horaActual.setHours(horaInicio, minInicio, 0);
        
        const horaFinal = new Date();
        horaFinal.setHours(horaFin, minFin, 0);
        
        while (horaActual < horaFinal) {
          const horaStr = horaActual.toTimeString().slice(0, 5);
          if (!horasOcupadas.includes(horaStr)) {
            slots.push(horaStr);
          }
          horaActual.setMinutes(horaActual.getMinutes() + 30);
        }
      });

      setHorariosDisponibles(slots);
      
      if (slots.length === 0) {
        agregarMensaje(t('noAvailableSlots'));
        setEstado('elegir_fecha');
        setOpciones([
          { id: 'hoy', texto: t('today') },
          { id: 'manana', texto: t('tomorrow') },
          { id: 'otra', texto: t('otherDate') }
        ]);
      } else {
        setDatos(prev => ({ ...prev, fecha }));
        agregarMensaje(t('selectTime'));
        setEstado('elegir_hora');
        setOpciones(slots.map(h => ({ id: h, texto: h })));
      }
    } catch (error) {
      console.error('Error cargando horarios:', error);
      agregarMensaje(t('loadingError'));
    } finally {
      setLoading(false);
    }
  };

  const confirmarCita = () => {
    const doctorName = datos.doctor?.usuario?.first_name && datos.doctor?.usuario?.last_name 
      ? `${datos.doctor.usuario.first_name} ${datos.doctor.usuario.last_name}`
      : '';
    
    const resumen = `${t('appointmentSummary')}:

${t('doctor')}: Dr. ${doctorName}
${t('date')}: ${datos.fecha}
${t('time')}: ${datos.hora}

${t('confirmAppointment')}`;
    
    agregarMensaje(resumen);
    setEstado('confirmar');
    setOpciones([
      { id: 'confirmar', texto: t('confirm') },
      { id: 'cancelar', texto: t('cancel') }
    ]);
  };

  const crearCita = async () => {
    setLoading(true);
    try {
      await axiosInstance.current.post('citas/', {
        doctor: datos.doctor.id,
        fecha: datos.fecha,
        hora: datos.hora,
        motivo: ''
      });

      agregarMensaje(t('appointmentConfirmed'));
      const doctorName = `${datos.doctor?.usuario?.first_name || ''} ${datos.doctor?.usuario?.last_name || ''}`;
      agregarMensaje(t('appointmentBooked', { doctorName, date: datos.fecha, time: datos.hora }));
      
      setEstado('inicio');
      setDatos({ especialidad: null, doctor: null, fecha: null, hora: null });
      setOpciones([
        { id: 'agendar', texto: t('bookAnother') },
        { id: 'mis_citas', texto: t('viewMyAppointments') }
      ]);
    } catch (error) {
      console.error('Error creando cita:', error);
      if (error.response?.data) {
        agregarMensaje(`Error: ${JSON.stringify(error.response.data)}`);
      } else {
        agregarMensaje(t('loadingError'));
      }
    } finally {
      setLoading(false);
    }
  };

  const manejarInput = (e) => {
    e.preventDefault();
    if (mensaje.trim() && estado === 'esperando_fecha') {
      seleccionarOpcion(mensaje.trim());
      setMensaje('');
    }
  };

  return (
    <div className="chat-ia-container">
      <div className="chat-ia-header">
        <div className="chat-ia-title">
          <span className="chat-ia-icon">📅</span>
          <span>{t('chatAssistantTitle') || 'Asistente de Citas'}</span>
        </div>
        <button className="chat-ia-close" onClick={onClose}>✕</button>
      </div>

      <div className="chat-ia-messages">
        {historial.map((msg) => (
          <div key={msg.id} className={`chat-message ${msg.tipo}`}>
            <div className="message-content">
              {msg.texto.split('\n').map((linea, i) => (
                <p key={`${msg.id}-${i}`}>{linea}</p>
              ))}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="chat-message ia">
            <div className="message-content typing">
              <span className="typing-dot">.</span>
              <span className="typing-dot">.</span>
              <span className="typing-dot">.</span>
            </div>
          </div>
        )}
        
        <div ref={chatEndRef} />
      </div>

      {opciones.length > 0 && (
        <div className="chat-sugerencias">
          {opciones.map((opcion) => (
            <button
              key={opcion.id}
              className="sugerencia-chip"
              onClick={() => seleccionarOpcion(opcion.id)}
              disabled={loading}
            >
              {opcion.texto}
            </button>
          ))}
        </div>
      )}

      {estado === 'esperando_fecha' && (
        <form className="chat-ia-input" onSubmit={manejarInput}>
          <input
            type="text"
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            placeholder="Ingresa fecha (YYYY-MM-DD)"
            disabled={loading}
          />
          <button type="submit" disabled={loading || !mensaje.trim()}>➤</button>
        </form>
      )}
    </div>
  );
};

export default ChatIA;