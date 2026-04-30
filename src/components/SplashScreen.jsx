import { useState, useRef, useEffect } from 'react'

export default function SplashScreen({ onStart }) {
  const saved = localStorage.getItem('lexicon_username') || ''
  const [value, setValue] = useState(saved)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [greeting, setGreeting] = useState('')
  const inputRef = useRef(null)

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 100) }, [])

  function handleStart() {
    const name = value.trim()
    if (name.length < 2) { setError('Please enter at least 2 characters.'); return }
    const isNew = !saved || saved !== name
    setGreeting(isNew
      ? `Welcome, <span>${name}</span>!<br>Let's start learning.`
      : `Welcome back, <span>${name}</span>!<br>Keep it up!`)
    setLoading(true)
    setTimeout(() => onStart(name), 1400)
  }

  return (
    <div className="splash" id="splash-screen">
      <div className="splash-bg-dots" />
      <div className="splash-card">
        {!loading ? (
          <>
            <div className="splash-logo">
              <span>L</span>exicon
            </div>
            <div className="splash-tagline">Your personal English word mastery app</div>
            <input
              ref={inputRef}
              className="splash-input"
              type="text"
              placeholder="Enter your name…"
              value={value}
              onChange={e => { setValue(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && value.trim().length >= 2 && handleStart()}
              maxLength={40}
            />
            {error && <div className="splash-error">{error}</div>}
            {saved && !error && (
              <div className="splash-welcome-back">
                {value.trim() && value.trim() !== saved
                  ? <span>Will switch from <strong>{saved}</strong> to <strong>{value.trim()}</strong>.</span>
                  : <span>Continuing as <strong>{saved}</strong> — or type a new name.</span>}
              </div>
            )}
            <button
              className="splash-btn"
              disabled={value.trim().length < 2}
              onClick={handleStart}
            >
              {saved ? 'Continue →' : 'Start Learning →'}
            </button>
          </>
        ) : (
          <>
            <div className="splash-loading-dots">
              <span /><span /><span />
            </div>
            <div
              className="splash-greeting"
              dangerouslySetInnerHTML={{ __html: greeting }}
            />
          </>
        )}
      </div>
    </div>
  )
}
