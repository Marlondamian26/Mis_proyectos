import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

// Small reusable reminder cards component
export default function ReminderCards({ citas = [], user = null, role = 'patient' }) {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [dismissed, setDismissed] = useState(() => {
    try {
      const raw = sessionStorage.getItem('dismissedReminders')
      return raw ? JSON.parse(raw) : []
    } catch (e) {
      return []
    }
  })

  const today = new Date()
  const parseDate = (d) => {
    if (!d) return null
    // expecting YYYY-MM-DD
    const parts = String(d).split('-')
    if (parts.length < 3) return new Date(d)
    return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
  }

  const { upcoming, canceledOrPostponed } = useMemo(() => {
    const up = []
    const cp = []

    citas.forEach(cita => {
      if (!cita || !cita.fecha) return
      const fecha = parseDate(cita.fecha)
      if (!fecha) return

        const pendingStates = ['pendiente', 'pending']
      const postponedStates = ['pospuesta', 'postponed']
      const historyStates = ['cancelada', 'cancelled', 'eliminada', 'deleted']

      if (pendingStates.includes(cita.estado) || postponedStates.includes(cita.estado)) {
        const end = new Date(fecha)
        end.setDate(end.getDate() + 1)
        if (today <= end) up.push(cita)
        return
      }

      if (historyStates.includes(cita.estado)) {
        cp.push(cita)
        return
      }
    })

    return { upcoming: up, canceledOrPostponed: cp }
  }, [citas])

  const handleDismiss = (id) => {
    const next = [...dismissed, id]
    setDismissed(next)
    try { sessionStorage.setItem('dismissedReminders', JSON.stringify(next)) } catch(e){}
  }

  const getAppointmentRoute = (cita) => {
    const pendingStates = ['pendiente', 'pending', 'pospuesta', 'postponed']
    const historyStates = ['cancelada', 'cancelled', 'eliminada', 'deleted']
    const isHistory = historyStates.includes(cita.estado)

    if (role === 'admin') {
      return { path: '/admin?tab=citas', state: { appointmentId: cita.id, showHistory: isHistory } }
    }

    if (isHistory) {
      return { path: '/citas', state: { appointmentId: cita.id, showHistory: true } }
    }

    return { path: '/citas', state: { appointmentId: cita.id } }
  }

  const handleViewAppointment = (cita) => {
    const route = getAppointmentRoute(cita)
    navigate(route.path, { state: route.state })
  }

  // Only show canceled/postponed that are not dismissed in this session
  const visibleCanceled = canceledOrPostponed.filter(c => !dismissed.includes(c.id))

  if ((upcoming.length === 0) && (visibleCanceled.length === 0)) return (
    <div style={{...styles.container}}>
      <h3 style={styles.title}><span style={styles.icon}>💡</span> {t('reminders')}</h3>
      <p style={styles.emptyText}>{t('noUpcomingAppointments') || t('noAppointments')}</p>
    </div>
  )

  return (
    <div style={{...styles.container}}>
      <h3 style={styles.title}><span style={styles.icon}>💡</span> {t('reminders')}</h3>

      <div style={styles.cardsWrap}>
        {upcoming.map(cita => (
          <div key={`up-${cita.id}`} style={styles.cardUpcoming}>
            <div style={styles.cardHeader}>{cita.estado === 'pospuesta' || cita.estado === 'postponed' ? t('postponedAppointment') : t('upcomingAppointment')}</div>
            <div style={styles.cardBody}>
              <div><strong>{cita.doctor_nombre || cita.doctor || t('doctor')}</strong></div>
              <div>{cita.fecha} {cita.hora || ''}</div>
              <div style={styles.cardActions}>
                <button onClick={() => handleViewAppointment(cita)} style={styles.dismissButton}>{t('viewAppointment') || 'Ver cita'}</button>
              </div>
            </div>
          </div>
        ))}

        {visibleCanceled.map(cita => (
          <div key={`cp-${cita.id}`} style={styles.cardCanceled}>
            <div style={styles.cardHeader}>{cita.estado === 'cancelada' || cita.estado === 'cancelled' ? t('cancelledAppointment') : t('postponedAppointment')}</div>
            <div style={styles.cardBody}>
              <div><strong>{cita.paciente_nombre || cita.paciente || t('patient')}</strong></div>
              <div>{cita.fecha} {cita.hora || ''}</div>
              <div style={styles.cardActions}>
                <button onClick={() => handleViewAppointment(cita)} style={styles.dismissButton}>{t('viewAppointment') || 'Ver cita'}</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const styles = {
  container: { backgroundColor: 'var(--bg-tertiary)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)' },
  title: { fontSize: '16px', margin: '0 0 10px 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' },
  icon: { fontSize: '18px' },
  cardsWrap: { display: 'flex', flexDirection: 'column', gap: '10px' },
  cardUpcoming: { backgroundColor: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' },
  cardCanceled: { backgroundColor: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' },
  cardHeader: { fontSize: '13px', fontWeight: '700', marginBottom: '6px', color: 'var(--text-primary)' },
  cardBody: { fontSize: '14px', color: 'var(--text-secondary)' },
  cardActions: { marginTop: '8px' },
  dismissButton: { background: 'transparent', border: '1px solid var(--border-color)', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', color: 'var(--text-primary)' },
  emptyText: { color: 'var(--text-muted)', marginTop: '8px' }
}
