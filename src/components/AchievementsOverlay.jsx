import { useEffect } from 'react'

export default function AchievementsOverlay({ achievements, unlocked, onClose }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="modal-overlay open"
      style={{ zIndex: 600 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="modal" style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <div className="modal-top">
            <div className="modal-word">🏆 Achievements</div>
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>
          <div className="modal-divider" />
        </div>
        <div className="modal-body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '8px 0' }}>
            {achievements.map(a => {
              const isUnlocked = !!unlocked[a.id]
              return (
                <div
                  key={a.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '12px 16px',
                    background: isUnlocked ? 'var(--accent-light)' : 'var(--surface2)',
                    border: `1.5px solid ${isUnlocked ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-sm)',
                    opacity: isUnlocked ? 1 : 0.5,
                  }}
                >
                  <span style={{ fontSize: 28 }}>{a.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: isUnlocked ? 'var(--accent)' : 'var(--text)' }}>
                      {a.title}
                    </div>
                    <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2 }}>{a.desc}</div>
                    {isUnlocked && (
                      <div style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 3 }}>
                        Unlocked {new Date(unlocked[a.id]).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  {isUnlocked && <span style={{ marginLeft: 'auto', color: 'var(--learned)', fontSize: 18 }}>✓</span>}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
