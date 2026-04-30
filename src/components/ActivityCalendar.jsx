import { useEffect, useMemo } from 'react'

const NUM_WEEKS = 16

function buildCalendar(activityMap) {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const endDay = new Date(today)
  endDay.setDate(endDay.getDate() + (6 - endDay.getDay()))
  const startDay = new Date(endDay)
  startDay.setDate(startDay.getDate() - NUM_WEEKS * 7 + 1)

  const maxVal = Math.max(1, ...Object.values(activityMap))
  function level(v) {
    if (!v) return ''
    if (v < maxVal * 0.25) return 'l1'
    if (v < maxVal * 0.5) return 'l2'
    if (v < maxVal * 0.75) return 'l3'
    return 'l4'
  }

  const weeks = []
  const cur = new Date(startDay)
  while (cur <= endDay) {
    const week = []
    for (let d = 0; d < 7; d++) { week.push(new Date(cur)); cur.setDate(cur.getDate() + 1) }
    weeks.push(week)
  }

  const totalDays = Object.keys(activityMap).length
  const totalAnswers = Object.values(activityMap).reduce((a, b) => a + b, 0)
  const bestEntry = Object.entries(activityMap).sort((a, b) => b[1] - a[1])[0]

  return { weeks, today, level, totalDays, totalAnswers, bestEntry }
}

export default function ActivityCalendar({ activityMap, onClose }) {
  const { weeks, today, level, totalDays, totalAnswers, bestEntry } = useMemo(
    () => buildCalendar(activityMap),
    [activityMap]
  )

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Month label row
  let prevMonth = -1
  const monthLabels = weeks.map((week, i) => {
    const m = week[0].getMonth()
    const label = m !== prevMonth ? week[0].toLocaleString('en', { month: 'short' }) : ''
    prevMonth = m
    return <div key={i} className="cal-month-cell" style={{ minWidth: 17 }}>{label}</div>
  })

  return (
    <div className="cal-overlay open" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="cal-modal">
        <div className="cal-header">
          <div className="cal-title">📅 Activity Calendar</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="cal-body">
          <div className="cal-subtitle">Your study activity over the last {NUM_WEEKS} weeks.</div>

          <div style={{ overflowX: 'auto' }}>
            <div style={{ minWidth: NUM_WEEKS * 17 + 40, display: 'flex', gap: 3 }}>
              {/* Day-of-week labels */}
              <div className="cal-day-labels">
                {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((l, i) => (
                  <div key={i} className="cal-day-label">{l}</div>
                ))}
              </div>

              {/* Grid */}
              <div style={{ flex: 1 }}>
                <div className="cal-month-row">{monthLabels}</div>
                <div style={{ display: 'flex', gap: 3 }}>
                  {weeks.map((week, wi) => (
                    <div key={wi} className="cal-week">
                      {week.map((day, di) => {
                        const key = day.toISOString().slice(0, 10)
                        const val = activityMap[key] || 0
                        const isFuture = day > today
                        return (
                          <div
                            key={di}
                            className={`cal-day ${isFuture ? '' : level(val)}`}
                            title={isFuture ? undefined : `${key}: ${val} answer${val !== 1 ? 's' : ''}`}
                          />
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="cal-legend">
            <span>Less</span>
            <div className="cal-legend-squares">
              <div className="cal-legend-sq" />
              <div className="cal-legend-sq l1" />
              <div className="cal-legend-sq l2" />
              <div className="cal-legend-sq l3" />
              <div className="cal-legend-sq l4" />
            </div>
            <span>More</span>
          </div>

          {/* Stats */}
          <div className="cal-stats">
            <div className="cal-stat">
              <div className="cal-stat-n">{totalDays}</div>
              <div className="cal-stat-l">Days Active</div>
            </div>
            <div className="cal-stat">
              <div className="cal-stat-n">{totalAnswers}</div>
              <div className="cal-stat-l">Total Answers</div>
            </div>
            <div className="cal-stat">
              <div className="cal-stat-n">{bestEntry ? bestEntry[1] : 0}</div>
              <div className="cal-stat-l">Best Day</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
