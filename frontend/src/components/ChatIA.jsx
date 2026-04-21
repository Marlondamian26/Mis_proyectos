import { useState, useEffect, useRef, useCallback } from 'react';
import axiosInstance from '../services/auth';
import './ChatIA.css';
import { useLanguage } from '../context/LanguageContext';

const ChatIA = ({ onClose }) => {
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

  const inicializar = useCallback(async (resetChat = false) => {
    if (resetChat) {
      setHistorial([]);
      setEstado('inicio');
      setDatos({ especialidad: null, doctor: null, fecha: null, hora: null });
      messageIdRef.current = 0;
    }
    setLoading(true);
    try {
      const espResponse = await axiosInstance.get('especialidades-publicas/');
      const espData = Array.isArray(espResponse.data) ? espResponse.data : (espResponse.data.results || []);
      setEspecialidades(espData);
      
      const docResponse = await axiosInstance.get('doctores-publicos/');
      const docData = Array.isArray(docResponse.data) ? docResponse.data : (docResponse.data.results || []);
      setDoctores(docData);
      
      setOpciones([
        { id: 'agendar', texto: t('scheduleAppointment') },
        { id: 'mis_citas', texto: t('myAppointments') },
        { id: 'cancelar_cita', texto: t('cancelAppointmentOption') },
        { id: 'posponer', texto: t('postponeAppointmentOption') },
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

  const seleccionarOpcion = useCallback(async (opcionId) => {
    const opcionIdStr = String(opcionId);
    console.log('[seleccionarOpcion] INICIO opcionId:', opcionId, 'estado:', estado);
    
    agregarMensaje(opciones.find(o => String(o.id) === opcionIdStr)?.texto || opcionId, 'usuario');
    setLoading(true);

    try {
      if (estado === 'elegir_especialidad') {
        const opcionIdNum = Number(opcionId);
        const esp = !isNaN(opcionIdNum) 
          ? especialidades.find(e => Number(e.id) === opcionIdNum || e.nombre.toLowerCase().includes(opcionIdStr.toLowerCase()))
          : especialidades.find(e => e.nombre.toLowerCase().includes(opcionIdStr.toLowerCase()));
        if (esp) {
          setDatos(prev => ({ ...prev, especialidad: esp }));
          
          const doctoresFiltrados = doctores.filter(d => 
            d.especialidad === esp.id || 
            d.especialidad_nombre === esp.nombre
          );
          
          if (doctoresFiltrados.length === 0) {
            agregarMensaje(`${t('noDoctorsAvailable')} ${esp.nombre}.`);
            agregarMensaje(t('chooseSpecialty'));
            setLoading(false);
            return;
          } else {
            agregarMensaje(t('whichDoctor'));
            setEstado('elegir_doctor');
            setOpciones(doctoresFiltrados.map(d => ({
              id: d.id,
              texto: `Dr. ${d.usuario?.first_name} ${d.usuario?.last_name} - ${d.especialidad_nombre || d.otra_especialidad}`
            })));
            setLoading(false);
            return;
          }
        }
      }
      
      if (estado === 'elegir_doctor') {
        const opcionIdNum = Number(opcionId);
        console.log('[elegir_doctor] opcionId:', opcionId, 'opcionIdNum:', opcionIdNum, 'doctores:', doctores.map(d => d.id));
        const doctor = doctores.find(d => Number(d.id) === opcionIdNum);
        console.log('[elegir_doctor] doctor encontrado:', doctor);
        if (doctor) {
          setDatos(prev => ({ ...prev, doctor }));
          agregarMensaje(t('whatDate'));
          setEstado('elegir_fecha');
          setOpciones([
            { id: 'hoy', texto: t('today') },
            { id: 'manana', texto: t('tomorrow') },
            { id: 'otra', texto: t('otherDate') }
          ]);
          console.log('[después de elegir_doctor] estado establecido a elegir_fecha');
          return;
        }
      }

      // Manejar estados específicos antes del switch para casos especiales
      if (estado === 'elegir_fecha') {
        console.log('[elegir_fecha handler] opcionId:', opcionId, 'estado:', estado);
        if (opcionId === 'hoy') {
          const hoy = new Date().toISOString().split('T')[0];
          setDatos(prev => ({ ...prev, fecha: hoy }));
          await cargarHorarios(datos.doctor?.id, hoy);
          return;
        } else if (opcionId === 'manana') {
          const manana = new Date(Date.now() + 86400000).toISOString().split('T')[0];
          setDatos(prev => ({ ...prev, fecha: manana }));
          await cargarHorarios(datos.doctor?.id, manana);
          return;
        } else if (opcionId === 'otra') {
          const mesesOptions = generarMesesOptions();
          agregarMensaje(t('selectMonth'));
          setEstado('elegir_mes');
          setOpciones(mesesOptions);
          return;
        }
      }

      if (estado === 'elegir_mes') {
        console.log('[elegir_mes handler] opcionId:', opcionId, 'citaSeleccionada:', !!citaSeleccionada);
        setMesSeleccionado(opcionId);
        const [anioMes, mesNum] = opcionId.split('-');
        const diasOptions = generarDiasOptions(parseInt(anioMes), parseInt(mesNum));
        agregarMensaje(t('selectDay'));
        setEstado('elegir_dia');
        setOpciones(diasOptions);
        return;
      }

      if (estado === 'elegir_dia') {
        console.log('[elegir_dia handler] opcionId:', opcionId);
        if (/^\d{4}-\d{2}-\d{2}$/.test(opcionId)) {
          // Check if we're in postpone flow (elegir_nueva_fecha or elegir_nueva_hora states)
          if (citaSeleccionada) {
            const citaDoctor = citaSeleccionada.doctor || citaSeleccionada.doctor_id;
            const doctorId = typeof citaDoctor === 'object' ? citaDoctor.id : citaDoctor;
            setNuevaFecha(opcionId);
            await cargarHorariosNuevos(doctorId, opcionId);
          } else {
            setDatos(prev => ({ ...prev, fecha: opcionId }));
            await cargarHorarios(datos.doctor?.id, opcionId);
          }
        }
        return;
      }

      if (estado === 'elegir_hora') {
        console.log('[elegir_hora handler] opcionId:', opcionId, 'horariosDisponibles:', horariosDisponibles);
        const horaRegex = /^(\d{1,2}:\d{2})$/;
        if (horaRegex.test(opcionId)) {
          setDatos(prev => ({ ...prev, hora: opcionId }));
          await confirmarCita();
          return;
        }
        // Fallback: buscar en horariosDisponibles
        if (horariosDisponibles.includes(opcionId)) {
          setDatos(prev => ({ ...prev, hora: opcionId }));
          await confirmarCita();
          return;
        }
        agregarMensaje(t('invalidOption'));
        setOpciones(horariosDisponibles.map(h => ({ id: h, texto: h })));
        return;
      }

      if (estado === 'elegir_nueva_hora') {
        console.log('[elegir_nueva_hora handler] opcionId:', opcionId);
        await procesarNuevaHora(opcionId);
        return;
      }

      if (estado === 'confirmar_cancelacion') {
        console.log('[confirmar_cancelacion handler] opcionId:', opcionId);
        if (opcionId === 'si') {
          await ejecutarCancelacion();
        } else {
          agregarMensaje(t('understood'));
          setEstado('inicio');
          setOpciones([
            { id: 'agendar', texto: t('scheduleAppointment') },
            { id: 'mis_citas', texto: t('myAppointments') },
            { id: 'cancelar_cita', texto: t('cancelAppointmentOption') },
            { id: 'posponer', texto: t('postponeAppointmentOption') },
            { id: 'ayuda', texto: t('needHelp') }
          ]);
        }
        return;
      }

      if (estado === 'confirmar_posposicion') {
        console.log('[confirmar_posposicion handler] opcionId:', opcionId);
        if (opcionId === 'si') {
          await ejecutarPosposicion();
        } else {
          agregarMensaje(t('understood'));
          setEstado('inicio');
          setOpciones([
            { id: 'agendar', texto: t('scheduleAppointment') },
            { id: 'mis_citas', texto: t('myAppointments') },
            { id: 'cancelar_cita', texto: t('cancelAppointmentOption') },
            { id: 'posponer', texto: t('postponeAppointmentOption') },
            { id: 'ayuda', texto: t('needHelp') }
          ]);
        }
        return;
      }

      console.log('[seleccionarOpcion] switch, opcionIdStr:', opcionIdStr, 'estado:', estado);
      // Manejar selección de cita para cancelar o posponer
      if (estado === 'elegir_cita_cancelar') {
        await procesarCancelacion(parseInt(opcionId));
        return;
      }
      if (estado === 'elegir_cita_posponer') {
        await procesarPosponer(parseInt(opcionId));
        return;
      }

      switch (opcionIdStr) {
        case 'agendar':
          if (especialidades.length === 0) {
            agregarMensaje(t('noDataAvailable'));
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
        case 'hoy':
        case 'manana':
        case 'otra':
          console.log('[elegir_fecha] opcionId:', opcionId, 'datos.doctor:', datos.doctor);
          if (opcionId === 'hoy') {
            const hoy = new Date().toISOString().split('T')[0];
            setDatos(prev => ({ ...prev, fecha: hoy }));
            await cargarHorarios(datos.doctor?.id, hoy);
          } else if (opcionId === 'manana') {
            const manana = new Date(Date.now() + 86400000).toISOString().split('T')[0];
            setDatos(prev => ({ ...prev, fecha: manana }));
            await cargarHorarios(datos.doctor?.id, manana);
          } else if (opcionId === 'otra') {
            const mesesOptions = generarMesesOptions();
            agregarMensaje(t('selectMonth'));
            setEstado('elegir_mes');
        setOpciones(generarMesesOptions());
            return;
          }
          break;

        case 'elegir_mes':
          console.log('[elegir_mes] opcionId:', opcionId);
          setMesSeleccionado(opcionId);
          const [anioMes, mesNum] = opcionId.split('-');
          const diasOptions = generarDiasOptions(parseInt(anioMes), parseInt(mesNum));
          agregarMensaje(t('selectDay'));
          setEstado('elegir_dia');
          setOpciones(diasOptions);
          return;

        case 'elegir_dia':
          console.log('[elegir_dia] opcionId:', opcionId);
          if (/^\d{4}-\d{2}-\d{2}$/.test(opcionId)) {
            setDatos(prev => ({ ...prev, fecha: opcionId }));
            await cargarHorarios(datos.doctor?.id, opcionId);
          }
          return;

        case 'esperando_fecha':
          console.log('[esperando_fecha] opcionId:', opcionId);
          let fechaValida = opcionId;
          // Handle YYYY-MM-DD format
          if (/^\d{4}-\d{2}-\d{2}$/.test(fechaValida)) {
            console.log('[esperando_fecha] formato YYYY-MM-DD');
            setDatos(prev => ({ ...prev, fecha: fechaValida }));
            await cargarHorarios(datos.doctor?.id, fechaValida);
          } else if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(fechaValida)) {
            // Handle DD-MM-YYYY or D-M-YYYY format
            console.log('[esperando_fecha] formato DD-MM-YYYY');
            const parts = fechaValida.split('-');
            const day = parts[0].padStart(2, '0');
            const month = parts[1].padStart(2, '0');
            const year = parts[2];
            fechaValida = `${year}-${month}-${day}`;
            console.log('[esperando_fecha] fecha convertida:', fechaValida);
            setDatos(prev => ({ ...prev, fecha: fechaValida }));
            await cargarHorarios(datos.doctor?.id, fechaValida);
          } else {
            console.log('[esperando_fecha] formato inválido');
            agregarMensaje(t('invalidDateFormat'));
          }
          break;

        case 'elegir_hora':
          console.log('[elegir_hora] opcionId:', opcionId, 'horariosDisponibles:', horariosDisponibles);
          // Aceptar directamente el ID ya que las opciones ya contienen horarios válidos
          const horaSeleccionada = opcionId;
          if (horaSeleccionada && /^(\d{2}:\d{2})$/.test(horaSeleccionada)) {
            console.log('[elegir_hora] hora válida, confirmando cita');
            setDatos(prev => ({ ...prev, hora: horaSeleccionada }));
            await confirmarCita();
          } else if (horariosDisponibles.includes(opcionId)) {
            console.log('[elegir_hora] hora encontrada en horariosDisponibles');
            setDatos(prev => ({ ...prev, hora: opcionId }));
            await confirmarCita();
          } else {
            console.log('[elegir_hora] hora inválida, mostrando opciones');
            agregarMensaje(t('invalidOption'));
            setOpciones(horariosDisponibles.map(h => ({ id: h, texto: h })));
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

        case 'mis_citas':
          setLoading(true);
          try {
            const misCitasResponse = await axiosInstance.get('mis-citas/');
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

        case 'cancelar':
          if (estado === 'confirmar') {
            agregarMensaje(t('understood'));
            setEstado('inicio');
            setDatos({ especialidad: null, doctor: null, fecha: null, hora: null });
            setOpciones([
              { id: 'agendar', texto: t('scheduleAppointment') },
              { id: 'mis_citas', texto: t('myAppointments') },
              { id: 'cancelar_cita', texto: t('cancelAppointmentOption') },
              { id: 'posponer', texto: t('postponeAppointmentOption') },
              { id: 'ayuda', texto: t('needHelp') }
            ]);
          } else {
            await mostrarCitasParaAccion('cancelar');
          }
          break;

        case 'cancelar_cita':
          await mostrarCitasParaAccion('cancelar');
          break;

        case 'posponer':
          await mostrarCitasParaAccion('posponer');
          break;

        case 'elegir_cita_cancelar':
          await procesarCancelacion(parseInt(opcionId));
          break;

        case 'elegir_cita_posponer':
          await procesarPosponer(parseInt(opcionId));
          break;

        case 'confirmar_cancelacion':
          if (opcionId === 'si') {
            await ejecutarCancelacion();
          } else {
            agregarMensaje(t('understood'));
            setEstado('inicio');
            setOpciones([
              { id: 'agendar', texto: t('scheduleAppointment') },
              { id: 'mis_citas', texto: t('myAppointments') },
              { id: 'cancelar_cita', texto: t('cancelAppointmentOption') },
              { id: 'posponer', texto: t('postponeAppointmentOption') },
              { id: 'ayuda', texto: t('needHelp') }
            ]);
          }
          break;

        case 'elegir_nueva_fecha':
          await procesarNuevaFecha(opcionId);
          break;

        case 'elegir_nueva_hora':
          await procesarNuevaHora(opcionId);
          break;

        case 'confirmar_posposicion':
          if (opcionId === 'si') {
            await ejecutarPosposicion();
          } else {
            agregarMensaje(t('understood'));
            setEstado('inicio');
            setOpciones([
              { id: 'agendar', texto: t('scheduleAppointment') },
              { id: 'mis_citas', texto: t('myAppointments') },
              { id: 'cancelar_cita', texto: t('cancelAppointmentOption') },
              { id: 'posponer', texto: t('postponeAppointmentOption') },
              { id: 'ayuda', texto: t('needHelp') }
            ]);
          }
          break;

        default:
          break;
      }
    } catch (error) {
      console.error('Error en seleccionarOpcion:', error);
      agregarMensaje(t('loadingError'));
    } finally {
      setLoading(false);
    }
  }, [estado, opciones, historial, especialidades, doctores, agregarMensaje, t, setLoading, setEstado, setOpciones, setDatos, datos]);

  const cargarHorarios = async (doctorId, fecha) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`horarios/disponibles/?doctor=${doctorId}&fecha=${fecha}`);
      
      const citasResponse = await axiosInstance.get('citas/', {
        params: { doctor: doctorId, fecha }
      });
      const citasOcupadas = Array.isArray(citasResponse.data) ? citasResponse.data : (citasResponse.data.results || []);
      const horasOcupadas = citasOcupadas.map(c => c.hora);

      const slots = [];
      // Default horarios if API doesn't return data
      const horariosData = [
        { hora_inicio: '08:00', hora_fin: '12:00', activo: true },
        { hora_inicio: '14:00', hora_fin: '18:00', activo: true }
      ];
      
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
      const response = await axiosInstance.post('citas/', {
        doctor: datos.doctor.id,
        fecha: datos.fecha,
        hora: datos.hora,
        motivo: ''
      });

      const doctorName = `${datos.doctor?.usuario?.first_name || ''} ${datos.doctor?.usuario?.last_name || ''}`;
      agregarMensaje(t('appointmentConfirmed'));
      agregarMensaje(t('appointmentBooked', { doctorName, date: datos.fecha, time: datos.hora }));
      
      setEstado('inicio');
      setDatos({ especialidad: null, doctor: null, fecha: null, hora: null });
      setOpciones([
        { id: 'agendar', texto: t('bookAnother') },
        { id: 'mis_citas', texto: t('viewMyAppointments') }
      ]);
    } catch (error) {
      console.error('Error creando cita:', error);
      if (error.response?.status >= 200 && error.response?.status < 300) {
        const doctorName = `${datos.doctor?.usuario?.first_name || ''} ${datos.doctor?.usuario?.last_name || ''}`;
        agregarMensaje(t('appointmentConfirmed'));
        agregarMensaje(t('appointmentBooked', { doctorName, date: datos.fecha, time: datos.hora }));
      } else if (error.response?.data) {
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

  const [citasDisponibles, setCitasDisponibles] = useState([]);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [nuevaFecha, setNuevaFecha] = useState(null);
  const [nuevaHora, setNuevaHora] = useState(null);
  const [horariosNuevos, setHorariosNuevos] = useState([]);
  const [mesSeleccionado, setMesSeleccionado] = useState(null);

  const generarMesesOptions = () => {
    const meses = [];
    const mesesNombres = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const fechaActual = new Date();
    const anioActual = fechaActual.getFullYear();
    const mesActual = fechaActual.getMonth();
    
    for (let i = 0; i < 6; i++) {
      let mes = (mesActual + i) % 12;
      let anio = anioActual + Math.floor((mesActual + i) / 12);
      meses.push({
        id: `${anio}-${String(mes + 1).padStart(2, '0')}`,
        texto: `${mesesNombres[mes]}-${anio}`
      });
    }
    return meses;
  };

  const generarDiasOptions = (anio, mes) => {
    const dias = [];
    const fecha = new Date(anio, mes - 1, 1);
    const diasEnMes = new Date(anio, mes, 0).getDate();
    const diaActual = new Date().getDate();
    const anioActual = new Date().getFullYear();
    const mesActual = new Date().getMonth() + 1;
    
    let diaInicio = 1;
    if (anio === anioActual && mes === mesActual) {
      diaInicio = diaActual;
    }
    
    for (let d = diaInicio; d <= diasEnMes; d++) {
      dias.push({
        id: `${anio}-${String(mes).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
        texto: String(d)
      });
    }
    return dias;
  };

  const mostrarCitasParaAccion = async (accion) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('mis-citas/');
      const misCitas = Array.isArray(response.data) ? response.data : (response.data.results || []);
      const citasPendentes = misCitas.filter(c => c.estado === 'pendiente' || c.estado === 'confirmada');
      
      setCitasDisponibles(citasPendentes);
      
      if (citasPendentes.length === 0) {
        agregarMensaje(accion === 'cancelar' ? t('noCitasToCancel') : t('noCitasToPostpone'));
        setEstado('inicio');
setOpciones([
        { id: 'agendar', texto: t('scheduleAppointment') },
        { id: 'mis_citas', texto: t('myAppointments') },
        { id: 'cancelar_cita', texto: t('cancelAppointmentOption') },
        { id: 'posponer', texto: t('postponeAppointmentOption') },
        { id: 'ayuda', texto: t('needHelp') }
      ]);
      } else {
        agregarMensaje(accion === 'cancelar' ? t('selectAppointmentToCancel') : t('selectAppointmentToPostpone'));
        setEstado(accion === 'cancelar' ? 'elegir_cita_cancelar' : 'elegir_cita_posponer');
        setOpciones(citasPendentes.map(c => ({
          id: c.id,
          texto: `${c.fecha} - ${c.hora} con Dr. ${c.doctor_nombre}`
        })));
      }
    } catch (error) {
      console.error('Error cargando citas:', error);
      agregarMensaje(t('loadingError'));
    } finally {
      setLoading(false);
    }
  };

  const procesarCancelacion = async (citaId) => {
    const cita = citasDisponibles.find(c => c.id === citaId);
    if (cita) {
      setCitaSeleccionada(cita);
      agregarMensaje(`${t('confirmCancellation')}\n\n📅 ${cita.fecha} - ${cita.hora}\n👨‍⚕️ Dr. ${cita.doctor_nombre}`);
      setEstado('confirmar_cancelacion');
      setOpciones([
        { id: 'si', texto: t('yes') },
        { id: 'no', texto: t('no') }
      ]);
    }
  };

  const procesarPosponer = async (citaId) => {
    const cita = citasDisponibles.find(c => c.id === citaId);
    if (cita) {
      setCitaSeleccionada(cita);
      agregarMensaje(t('selectNewDate'));
      setEstado('elegir_nueva_fecha');
      setOpciones([
        { id: 'hoy', texto: t('today') },
        { id: 'manana', texto: t('tomorrow') },
        { id: 'otra', texto: t('otherDate') }
      ]);
    }
  };

   const procesarNuevaFecha = async (opcionId) => {
     let fechaSeleccionada;
     if (opcionId === 'hoy') {
       fechaSeleccionada = new Date().toISOString().split('T')[0];
     } else if (opcionId === 'manana') {
       fechaSeleccionada = new Date(Date.now() + 86400000).toISOString().split('T')[0];
     } else {
       agregarMensaje(t('selectMonth'));
       setEstado('elegir_mes');
       setOpciones(generarMesesOptions());
       return;
     }
     
setNuevaFecha(fechaSeleccionada);
      const citaDoctor = citaSeleccionada.doctor || citaSeleccionada.doctor_id;
      const doctorId = typeof citaDoctor === 'object' ? citaDoctor.id : citaDoctor;
      await cargarHorariosNuevos(doctorId, fechaSeleccionada);
   };

  const cargarHorariosNuevos = async (doctorId, fecha) => {
    setLoading(true);
    try {
      const citasResponse = await axiosInstance.get('citas/', {
        params: { doctor: doctorId, fecha }
      });
      const citasOcupadas = Array.isArray(citasResponse.data) ? citasResponse.data : (citasResponse.data.results || []);
      const horasOcupadas = citasOcupadas.map(c => c.hora);

      const slots = [];
      const horariosData = [
        { hora_inicio: '08:00', hora_fin: '12:00', activo: true },
        { hora_inicio: '14:00', hora_fin: '18:00', activo: true }
      ];
      
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

      setHorariosNuevos(slots);
      
      if (slots.length === 0) {
        agregarMensaje(t('noAvailableSlots'));
        setOpciones([
          { id: 'hoy', texto: t('today') },
          { id: 'manana', texto: t('tomorrow') },
          { id: 'otra', texto: t('otherDate') }
        ]);
      } else {
        setNuevaFecha(fecha);
        agregarMensaje(t('selectNewTime'));
        setEstado('elegir_nueva_hora');
        setOpciones(slots.map(h => ({ id: h, texto: h })));
      }
    } catch (error) {
      console.error('Error cargando horarios:', error);
      agregarMensaje(t('loadingError'));
    } finally {
      setLoading(false);
    }
  };

  const procesarNuevaHora = async (horaSeleccionada) => {
    setNuevaHora(horaSeleccionada);
    const resumen = `${t('appointmentSummary')}:

📅 ${nuevaFecha}
⏰ ${horaSeleccionada}
👨‍⚕️ Dr. ${citaSeleccionada?.doctor_nombre}

${t('confirmPostponement')}`;
    
    agregarMensaje(resumen);
    setEstado('confirmar_posposicion');
    setOpciones([
      { id: 'si', texto: t('yes') },
      { id: 'no', texto: t('no') }
    ]);
  };

  const ejecutarCancelacion = async () => {
    setLoading(true);
    try {
      await axiosInstance.post(`citas/${citaSeleccionada.id}/cancelar/`);
      
      agregarMensaje(t('appointmentCancelled'));
      
      setEstado('inicio');
      setCitaSeleccionada(null);
      setOpciones([
        { id: 'agendar', texto: t('scheduleAppointment') },
        { id: 'mis_citas', texto: t('myAppointments') },
        { id: 'cancelar_cita', texto: t('cancelAppointmentOption') },
        { id: 'posponer', texto: t('postponeAppointmentOption') },
        { id: 'ayuda', texto: t('needHelp') }
      ]);
    } catch (error) {
      console.error('Error cancelando cita:', error);
      if (error.response?.status === 200 || error.response?.status === 201 || error.response?.status === 204) {
        agregarMensaje(t('appointmentCancelled'));
      } else if (error.response?.status === 404 && error.response?.data?.detail === 'Already cancelled') {
        agregarMensaje(t('appointmentCancelled'));
      } else {
        agregarMensaje(t('loadingError'));
      }
    } finally {
      setLoading(false);
    }
  };

  const ejecutarPosposicion = async () => {
    setLoading(true);
    try {
      await axiosInstance.patch(`citas/${citaSeleccionada.id}/`, {
        fecha: nuevaFecha,
        hora: nuevaHora
      });
      
      agregarMensaje(t('appointmentPostponed'));
      agregarMensaje(`📅 ${nuevaFecha} a las ${nuevaHora}`);
      
      setEstado('inicio');
      setCitaSeleccionada(null);
      setNuevaFecha(null);
      setNuevaHora(null);
      setOpciones([
        { id: 'agendar', texto: t('scheduleAppointment') },
        { id: 'mis_citas', texto: t('myAppointments') },
        { id: 'cancelar_cita', texto: t('cancelAppointmentOption') },
        { id: 'posponer', texto: t('postponeAppointmentOption') },
        { id: 'ayuda', texto: t('needHelp') }
      ]);
    } catch (error) {
      console.error('Error posponiendo cita:', error);
      agregarMensaje(t('loadingError'));
    } finally {
      setLoading(false);
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