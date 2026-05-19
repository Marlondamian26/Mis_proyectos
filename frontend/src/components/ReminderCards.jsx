import React, { useMemo, useState } from 'react'
import { useLanguage } from '../context/LanguageContext'

// Small reusable reminder cards component
export default function ReminderCards({ citas = [], user = null, role = 'patient' }) {
  const { t } = useLanguage()
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

      // upcoming: pendiente and fecha >= hoy and not expired (fecha + 1 day)
      if ((cita.estado === 'pendiente' || cita.estado === 'pending') ) {
        const end = new Date(fecha)
        end.setDate(end.getDate() + 1)
        if (today <= end) up.push(cita)
        return
      }

      // cancelled or postponed
      if (cita.estado === 'cancelada' || cita.estado === 'pospuesta' || cita.estado === 'cancelled' || cita.estado === 'postponed') {
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
            <div style={styles.cardHeader}>Próxima cita</div>
            <div style={styles.cardBody}>
              <div><strong>{cita.doctor_nombre || cita.doctor || t('doctor')}</strong></div>
              <div>{cita.fecha} {cita.hora || ''}</div>
              <div style={styles.cardActions}>
                <button onClick={() => handleDismiss(cita.id)} style={styles.dismissButton}>{t('dismiss') || 'Cerrar'}</button>
              </div>
            </div>
          </div>
        ))}

        {visibleCanceled.map(cita => (
          <div key={`cp-${cita.id}`} style={styles.cardCanceled}>
            <div style={styles.cardHeader}>{cita.estado === 'cancelada' || cita.estado === 'cancelled' ? 'Cita Cancelada' : 'Cita Pospuesta'}</div>
            <div style={styles.cardBody}>
              <div><strong>{cita.paciente_nombre || cita.paciente || t('patient')}</strong></div>
              <div>{cita.fecha} {cita.hora || ''}</div>
              <div style={styles.cardActions}>
                <button onClick={() => handleDismiss(cita.id)} style={styles.dismissButton}>{t('dismiss') || 'Cerrar'}</button>
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
  cardUpcoming: { background: 'linear-gradient(90deg,#e6f6ff,#f6fbff)', padding: '12px', borderRadius: '8px', border: '1px solid #bfe6ff' },
  cardCanceled: { background: 'linear-gradient(90deg,#fff6f6,#fffafa)', padding: '12px', borderRadius: '8px', border: '1px solid #ffd6d6' },
  cardHeader: { fontSize: '13px', fontWeight: '700', marginBottom: '6px' },
  cardBody: { fontSize: '14px', color: 'var(--text-secondary)' },
  cardActions: { marginTop: '8px' },
  dismissButton: { background: 'transparent', border: '1px solid var(--border-color)', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer' },
  emptyText: { color: 'var(--text-muted)', marginTop: '8px' }
}
