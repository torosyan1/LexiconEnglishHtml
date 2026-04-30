import { useState, useEffect, useRef, useCallback } from 'react'

export default function TestPage({ words, onClose, onAnswer }) {
  const [index, setIndex] = useState(0)
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [answered, setAnswered] = useState(false)
  const [correct, setCorrect] = useState(0)
  const [wrong, setWrong] = useState(0)
  const [wrongWords, setWrongWords] = useState([])
  const [done, setDone] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [wordTime, setWordTime] = useState(0)
  const inputRef = useRef(null)
  const startTimeRef = useRef(Date.now())
  const wordStartRef = useRef(Date.now())
  const timerRef = useRef(null)

  useEffect(() => {
    timerRef.current = setInterval(() => setElapsed(Date.now() - startTimeRef.current), 1000)
    return () => clearInterval(timerRef.current)
  }, [])

  useEffect(() => {
    if (!done) {
      setInput(''); setFeedback(null); setRevealed(false); setAnswered(false)
      wordStartRef.current = Date.now()
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [index, done])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Enter' && answered && !done) nextWord()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [answered, done])

  const w = words[index]
  const pct = words.length ? ((index) / words.length) * 100 : 0

  function formatTime(ms) {
    const s = Math.floor(ms / 1000)
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
  }

  function check() {
    if (!w || answered) return
    const guess = input.trim().toLowerCase()
    if (!guess) { inputRef.current?.focus(); return }
    const isCorrect = guess === w.word.toLowerCase()
    const wt = Date.now() - wordStartRef.current
    setWordTime(wt)
    setFeedback(isCorrect ? 'correct' : 'wrong')
    setAnswered(true)
    if (isCorrect) {
      setCorrect(c => c + 1)
      onAnswer(true, w.word)
    } else {
      setWrong(wr => wr + 1)
      setWrongWords(ww => [...ww, w])
      onAnswer(false, w.word)
    }
  }

  function showAnswer() {
    if (answered) return
    const wt = Date.now() - wordStartRef.current
    setWordTime(wt)
    setRevealed(true)
    setAnswered(true)
    setWrong(wr => wr + 1)
    setWrongWords(ww => [...ww, w])
    onAnswer(false, w.word)
  }

  function nextWord() {
    if (index >= words.length - 1) {
      setDone(true)
      clearInterval(timerRef.current)
    } else {
      setIndex(i => i + 1)
    }
  }

  const acc = (correct + wrong) > 0 ? Math.round(correct / (correct + wrong) * 100) : null
  const score = words.length ? Math.round(correct / words.length * 100) : 0

  function getResultEmoji() {
    if (score >= 90) return '🏆'
    if (score >= 70) return '🎉'
    if (score >= 50) return '💪'
    return '📚'
  }

  if (done) {
    return (
      <div className="test-pg open">
        <div className="test-pg-header">
          <button className="test-back-btn" onClick={onClose}>← Back to Words</button>
          <div className="test-pg-title">Test Complete</div>
          <div />
        </div>
        <div className="test-pg-bar-track"><div className="test-pg-bar-fill" style={{ width: '100%' }} /></div>
        <div className="test-res-body">
          <div className="test-res-emoji">{getResultEmoji()}</div>
          <div className="test-res-score">{score}%</div>
          <div className="test-res-title">{score >= 70 ? 'Great job!' : 'Keep practicing!'}</div>
          <div className="test-res-sub">
            {correct} correct · {wrong} wrong · {formatTime(elapsed)} total time
          </div>
          <div className="test-res-grid">
            <div className="test-stat">
              <div className="test-stat-n" style={{ color: 'var(--learned)' }}>{correct}</div>
              <div className="test-stat-l">Correct</div>
            </div>
            <div className="test-stat">
              <div className="test-stat-n" style={{ color: '#dc2626' }}>{wrong}</div>
              <div className="test-stat-l">Wrong</div>
            </div>
            <div className="test-stat">
              <div className="test-stat-n" style={{ color: 'var(--accent)' }}>{acc !== null ? acc + '%' : '—'}</div>
              <div className="test-stat-l">Accuracy</div>
            </div>
          </div>
          <div className="test-res-actions">
            <button className="test-res-retry" onClick={() => { setIndex(0); setCorrect(0); setWrong(0); setWrongWords([]); setDone(false); setElapsed(0); startTimeRef.current = Date.now() }}>↺ Retry</button>
            <button className="test-res-home" onClick={onClose}>← Back to Words</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="test-pg open" id="test-pg">
      <div className="test-pg-header">
        <button className="test-back-btn" onClick={onClose}>← Back to Words</button>
        <div className="test-pg-title">🧪 Test Your Knowledge</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="test-pg-total-timer">{formatTime(elapsed)}</div>
          <div className="test-pg-counter">{index + 1} / {words.length}</div>
        </div>
      </div>
      <div className="test-pg-bar-track">
        <div className="test-pg-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="test-pg-body">
        <div className="test-pg-card">
          <div className="test-pg-sublabel">Translate to English</div>
          <div className="test-pg-meaning">{(w?.meanings || []).slice(0, 2).join(' · ')}</div>
          <div className="test-pg-phrases">{(w?.phrases || []).slice(0, 1).map(p => p.tr).join('')}</div>
          <div className="test-pg-input-row">
            <input
              ref={inputRef}
              className={`test-pg-input ${feedback === 'correct' ? 'state-correct' : feedback === 'wrong' ? 'state-wrong' : ''}`}
              type="text"
              placeholder="Type the English word…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { if (!answered) check(); else nextWord() } }}
              disabled={answered}
              autoComplete="off"
              spellCheck="false"
            />
            <button className="test-pg-submit" onClick={check} disabled={answered}>Check ↵</button>
          </div>
          {feedback === 'correct' && <div className="test-pg-feedback ok">✓ Correct!</div>}
          {feedback === 'wrong' && <div className="test-pg-feedback fail">✗ Correct answer: <strong>{w?.word}</strong></div>}
          {revealed && <div className="test-pg-revealed show">{w?.word}</div>}
          {answered && wordTime > 0 && (
            <div className="test-pg-word-time show">Time: {(wordTime / 1000).toFixed(1)}s</div>
          )}
          <div className="test-pg-btn-row">
            {!answered && <button className="test-pg-hint-btn" onClick={showAnswer}>Show Answer</button>}
            {answered && <button className="test-pg-audio-btn show" onClick={() => w && window.speechSynthesis && (() => { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(w.word); u.lang = 'en-US'; u.rate = 0.85; speechSynthesis.speak(u) })()}>🔊 Hear it</button>}
          </div>
          {answered && (
            <button className="test-pg-next-btn show" onClick={nextWord}>
              {index >= words.length - 1 ? 'See Results →' : 'Next Word →'}
            </button>
          )}
        </div>

        <div className="test-pg-stats">
          <div className="test-stat"><div className="test-stat-n">{correct}</div><div className="test-stat-l">Correct</div></div>
          <div className="test-stat"><div className="test-stat-n">{wrong}</div><div className="test-stat-l">Wrong</div></div>
          <div className="test-stat"><div className="test-stat-n">{acc !== null ? acc + '%' : '—'}</div><div className="test-stat-l">Accuracy</div></div>
        </div>
      </div>
    </div>
  )
}
