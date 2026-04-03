import { useState, useEffect, useRef } from 'react';
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
  const { t } = useLanguage();
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
  
  const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  const inicializar = async () => {
    setLoading(true);
    try {
      const espResponse = await axiosInstance.get('especialidades-publicas/');
      setEspecialidades(espResponse.data || []);
      
      const docResponse = await axiosInstance.get('doctores-publicos/');
      setDoctores(docResponse.data || []);
      
      setOpciones([
        { id: 'agendar', texto: t('scheduleAppointment') || 'Agendar cita médica' },
        { id: 'mis_citas', texto: t('myAppointments') || 'Mis citas' },
        { id: 'ayuda', texto: t('needHelp') || 'Necesito ayuda' }
      ]);
    } catch (error) {
      console.error('Error inicializando:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    inicializar();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [historial]);

  const agregarMensaje = (texto, tipo = 'ia') => {
    setHistorial(prev => [...prev, { id: Date.now(), tipo, texto, timestamp: new Date() }]);
  };

  const seleccionarOpcion = async (opcionId) => {
    agregarMensaje(opciones.find(o => o.id === opcionId)?.texto || opcionId, 'usuario');
    setLoading(true);

    try {
      switch (opcionId) {
        case 'agendar':
          if (especialidades.length === 0) {
            agregarMensaje('Lo siento, no hay especialidades disponibles en este momento.');
            setEstado('inicio');
            setOpciones([
              { id: 'agendar', texto: t('scheduleAppointment') || 'Agendar cita médica' },
              { id: 'mis_citas', texto: t('myAppointments') || 'Mis citas' }
            ]);
          } else {
            agregarMensaje('¿Qué especialidad necesitas?');
            setEstado('elegir_especialidad');
            setOpciones(especialidades.map(esp => ({
              id: esp.id,
              texto: esp.nombre
            })));
            if (especialidades.length > 0) {
              agregarMensaje('Selecciona una especialidad:', 'ia');
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
              agregarMensaje(`No hay doctores disponibles de ${espSeleccionada.nombre}.`);
              agregarMensaje('¿Qué especialidad necesitas?');
              setEstado('elegir_especialidad');
              setOpciones(especialidades.map(esp => ({
                id: esp.id,
                texto: esp.nombre
              })));
            } else {
              agregarMensaje(`¿Con qué doctor quieres la cita?`);
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
            agregarMensaje('¿Qué fecha te conviene? ( formato: YYYY-MM-DD )');
            setEstado('elegir_fecha');
            setOpciones([
              { id: 'hoy', texto: 'Hoy' },
              { id: 'manana', texto: 'Mañana' },
              { id: 'otra', texto: 'Otra fecha' }
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
            agregarMensaje('Por favor ingresa una fecha en formato YYYY-MM-DD');
            setEstado('esperando_fecha');
          }
          break;

        case 'esperando_fecha':
          const fechaValida = opcionId;
          if (/^\d{4}-\d{2}-\d{2}$/.test(fechaValida)) {
            setDatos(prev => ({ ...prev, fecha: fechaValida }));
            await cargarHorarios(datos.doctor?.id, fechaValida);
          } else {
            agregarMensaje('Formato de fecha inválido. Use YYYY-MM-DD');
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
            agregarMensaje('Faltan datos. Vamos a empezar de nuevo.');
            setEstado('inicio');
            setDatos({ especialidad: null, doctor: null, fecha: null, hora: null });
            setOpciones([
              { id: 'agendar', texto: t('scheduleAppointment') || 'Agendar cita médica' },
              { id: 'mis_citas', texto: t('myAppointments') || 'Mis citas' }
            ]);
          }
          break;

        case 'cancelar':
          agregarMensaje('Entendido. ¿En qué más puedo ayudarte?');
          setEstado('inicio');
          setDatos({ especialidad: null, doctor: null, fecha: null, hora: null });
          setOpciones([
            { id: 'agendar', texto: t('scheduleAppointment') || 'Agendar cita médica' },
            { id: 'mis_citas', texto: t('myAppointments') || 'Mis citas' }
          ]);
          break;

        case 'mis_citas':
          setLoading(true);
          try {
            const misCitasResponse = await axiosInstance.get('mis-citas/');
            const misCitas = misCitasResponse.data || [];
            
            if (misCitas.length === 0) {
              agregarMensaje('No tienes citas programadas.');
            } else {
              agregarMensaje('Tus citas programadas:', 'ia');
              misCitas.forEach(cita => {
                agregarMensaje(
                  `- ${cita.fecha} a las ${cita.hora} con Dr. ${cita.doctor_nombre} (${cita.estado})`,
                  'ia'
                );
              });
            }
          } catch (error) {
            console.error('Error cargando citas:', error);
            agregarMensaje('Error al cargar tus citas.');
          }
          setEstado('inicio');
          setOpciones([
            { id: 'agendar', texto: t('scheduleAppointment') || 'Agendar cita médica' },
            { id: 'ayuda', texto: t('needHelp') || 'Necesito ayuda' }
          ]);
          break;

        case 'ayuda':
          agregarMensaje('¿En qué puedo ayudarte?');
          setOpciones([
            { id: 'info', texto: 'Información de la clínica' },
            { id: 'contacto', texto: 'Contactar a soporte' },
            { id: 'volver', texto: 'Volver al menú principal' }
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
      agregarMensaje('Ocurrió un error. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const cargarHorarios = async (doctorId, fecha) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`horarios/disponibles/?doctor=${doctorId}&fecha=${fecha}`);
      const horariosData = response.data || [];
      
      const citasResponse = await axiosInstance.get('citas/', {
        params: { doctor: doctorId, fecha }
      });
      const citasOcupadas = citasResponse.data || [];
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
        agregarMensaje('No hay horarios disponibles para esa fecha.');
        setEstado('elegir_fecha');
        setOpciones([
          { id: 'hoy', texto: 'Hoy' },
          { id: 'manana', texto: 'Mañana' },
          { id: 'otra', texto: 'Otra fecha' }
        ]);
      } else {
        setDatos(prev => ({ ...prev, fecha }));
        agregarMensaje('Selecciona un horario:');
        setEstado('elegir_hora');
        setOpciones(slots.map(h => ({ id: h, texto: h })));
      }
    } catch (error) {
      console.error('Error cargando horarios:', error);
      agregarMensaje('Error al cargar horarios. Intenta con otra fecha.');
    } finally {
      setLoading(false);
    }
  };

  const confirmarCita = () => {
    const resumen = `
📋 Resumen de tu cita:

👨‍⚕️ Doctor: Dr. ${datos.doctor?.usuario?.first_name} ${datos.doctor?.usuario?.last_name}
📅 Fecha: ${datos.fecha}
⏰ Hora: ${datos.hora}

¿Confirmas esta cita?
    `.trim();
    
    agregarMensaje(resumen);
    setEstado('confirmar');
    setOpciones([
      { id: 'confirmar', texto: '✅ Confirmar cita' },
      { id: 'cancelar', texto: '❌ Cancelar' }
    ]);
  };

  const crearCita = async () => {
    setLoading(true);
    try {
      await axiosInstance.post('citas/', {
        doctor: datos.doctor.id,
        fecha: datos.fecha,
        hora: datos.hora,
        motivo: ''
      });

      agregarMensaje('🎉 ¡Cita confirmada exitosamente!');
      agregarMensaje(`Tu cita con Dr. ${datos.doctor?.usuario?.first_name} el ${datos.fecha} a las ${datos.hora} ha sido agendada.`);
      
      setEstado('inicio');
      setDatos({ especialidad: null, doctor: null, fecha: null, hora: null });
      setOpciones([
        { id: 'agendar', texto: t('scheduleAppointment') || 'Agendar otra cita' },
        { id: 'mis_citas', texto: t('myAppointments') || 'Ver mis citas' }
      ]);
    } catch (error) {
      console.error('Error creando cita:', error);
      if (error.response?.data) {
        agregarMensaje(`Error: ${JSON.stringify(error.response.data)}`);
      } else {
        agregarMensaje('Error al crear la cita. Intenta de nuevo.');
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
                <p key={i}>{linea}</p>
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