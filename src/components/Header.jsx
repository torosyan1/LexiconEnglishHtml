import { useEffect, useRef } from 'react'

export default function Header({ username, onUsernameClick, learned, total, pct, darkMode, onToggleDark, onReset, onOpenAchievements, onOpenCalendar }) {
  const headerRef = useRef(null)

  useEffect(() => {
    function onScroll() {
      headerRef.current?.classList.toggle('scrolled', window.scrollY > 8)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className="header" ref={headerRef}>
      <div className="header-inner">

        <div className="progress-wrap">
          <div className="progress-label">
            <span id="progress-text">{learned} / {total} learned</span>
            <span id="progress-pct">{pct}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" id="progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="header-brand">
          <div className="logo">
            <span className="logo-emblem">L</span>
            <span className="logo-rest">exicon<span className="logo-dot">.</span></span>
          </div>

          <div className="header-actions">
            {username && (
              <div
                className="splash-username-badge"
                id="header-username-badge"
                style={{ position: 'static', cursor: 'pointer' }}
                onClick={onUsernameClick}
                title="Click to change name"
              >
                👤 {username}
              </div>
            )}

            <button className="icon-btn" id="achiev-btn" title="Achievements" onClick={onOpenAchievements}>
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13.5c-3.3 0-6-2.7-6-6V4h12v3.5c0 3.3-2.7 6-6 6z"/>
                <path d="M4.2 6H2.5c0 2.5 1.5 4.2 3.3 4.8M15.8 6h1.7c0 2.5-1.5 4.2-3.3 4.8"/>
                <line x1="10" y1="13.5" x2="10" y2="16.5"/>
                <line x1="6.5" y1="16.5" x2="13.5" y2="16.5"/>
              </svg>
            </button>

            <button className="icon-btn" id="cal-btn" title="Activity Calendar" onClick={onOpenCalendar}>
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3.5" width="16" height="15" rx="2.5"/><path d="M2 8.5h16"/>
                <line x1="6.5" y1="2" x2="6.5" y2="5"/><line x1="13.5" y1="2" x2="13.5" y2="5"/>
                <circle cx="10" cy="13" r="1" fill="currentColor" stroke="none"/>
              </svg>
            </button>

            <button className="icon-btn" id="dark-toggle" title="Toggle dark mode" onClick={onToggleDark}>
              {darkMode
                ? <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <circle cx="10" cy="10" r="3.5"/>
                    <path d="M10 1v2M10 17v2M1 10h2M17 10h2M3.5 3.5l1.4 1.4M15.1 15.1l1.4 1.4M3.5 16.5l1.4-1.4M15.1 4.9l1.4-1.4"/>
                  </svg>
                : <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M17 11.5A7 7 0 0 1 8.5 3a7 7 0 1 0 8.5 8.5z"/>
                  </svg>
              }
            </button>

            <button className="icon-btn" id="reset-btn" title="Reset all progress" onClick={onReset}>
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3.5 10a6.5 6.5 0 0 1 6.5-6.5 6.5 6.5 0 0 1 4.7 2L17 8"/>
                <path d="M17 4v4h-4"/>
              </svg>
            </button>
          </div>
        </div>

      </div>
    </header>
  )
}
