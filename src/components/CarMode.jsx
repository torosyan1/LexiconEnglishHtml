import { useState, useEffect, useRef, useCallback } from 'react'

export default function CarMode({ words, learnedMap, onToggleLearned, onClose, speakWord }) {
  const [carFilter, setCarFilter] = useState('all')
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [delay, setDelay] = useState(4000)
  const [loop, setLoop] = useState(false)
  const timerRef = useRef(null)

  const list = words.filter(w => {
    if (carFilter === 'learned') return !!learnedMap[w.word]
    if (carFilter === 'notlearned') return !learnedMap[w.word]
    return true
  })

  const current = list[index]

  const speak = useCallback((w) => { if (w) speakWord(w.word) }, [speakWord])

  useEffect(() => {
    if (current) speak(current)
  }, [index])

  useEffect(() => {
    clearInterval(timerRef.current)
    if (playing && list.length > 0) {
      timerRef.current = setInterval(() => {
        setIndex(i => {
          if (i >= list.length - 1) {
            if (loop) return 0
            setPlaying(false)
            return i
          }
          return i + 1
        })
      }, delay)
    }
    return () => clearInterval(timerRef.current)
  }, [playing, delay, loop, list.length])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  function goTo(i) {
    const clamped = Math.max(0, Math.min(list.length - 1, i))
    setIndex(clamped)
  }

  const pct = list.length ? ((index + 1) / list.length) * 100 : 0

  return (
    <div className="car-pg open" id="car-pg">
      <div className="car-header">
        <button className="test-back-btn" onClick={onClose}>← Back</button>
        <div className="car-header-title">🚗 Car Mode</div>
        <div className="car-counter-badge">{list.length ? `${index + 1} / ${list.length}` : '0 / 0'}</div>
      </div>
      <div className="car-prog-track">
        <div className="car-prog-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="car-body">
        <div className="car-filter-row">
          {['all', 'notlearned', 'learned'].map(f => (
            <button
              key={f}
              className={`car-filter-btn ${carFilter === f ? 'active' : ''}`}
              onClick={() => { setCarFilter(f); setIndex(0) }}
            >
              {f === 'all' ? 'All words' : f === 'notlearned' ? 'Not learned' : 'Learned'}
            </button>
          ))}
        </div>

        <div className="car-word-display">
          <div className="car-en-word">{current?.word || '—'}</div>
          <div className="car-translation">{(current?.meanings || []).slice(0, 2).join(' · ')}</div>
          <div className="car-learned-tag">
            {current && learnedMap[current.word] ? '✓ Learned' : ''}
          </div>
        </div>

        <div className="car-controls">
          <button className="car-nav-btn" onClick={() => goTo(index - 1)} disabled={index <= 0}>←</button>
          <button className="car-play-btn" onClick={() => setPlaying(p => !p)}>
            {playing ? '⏸' : '▶'}
          </button>
          <button className="car-nav-btn" onClick={() => goTo(index + 1)} disabled={index >= list.length - 1}>→</button>
        </div>

        <div className="car-speed-row">
          <span className="car-speed-label">Delay per word:</span>
          {[2000, 4000, 7000, 12000].map(d => (
            <button
              key={d}
              className={`car-speed-btn ${delay === d ? 'active' : ''}`}
              onClick={() => setDelay(d)}
            >{d / 1000}s</button>
          ))}
        </div>

        <div className="car-repeat-row">
          <button
            className={`car-repeat-btn ${loop ? 'active' : ''}`}
            onClick={() => setLoop(l => !l)}
          >🔁 Loop{loop ? ' (on)' : ''}</button>
        </div>

        {current && (
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <button
              className="modal-learn-btn"
              style={{ display: 'inline-block' }}
              onClick={() => onToggleLearned(current.word)}
            >
              {learnedMap[current.word] ? '✓ Learned' : '○ Mark as Learned'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
