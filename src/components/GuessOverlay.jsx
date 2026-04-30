import { useState, useEffect, useRef } from 'react'

export default function GuessOverlay({
  word: w, index, total,
  onClose, onPrev, onNext,
  onCorrect, onWrong, speakWord,
}) {
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [answered, setAnswered] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    setInput(''); setFeedback(null); setRevealed(false); setAnswered(false)
    setTimeout(() => inputRef.current?.focus(), 80)
  }, [w?.word])

  useEffect(() => { document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = '' } }, [])

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight' && !e.target.matches('input')) onNext()
      if (e.key === 'ArrowLeft' && !e.target.matches('input')) onPrev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, onNext, onPrev])

  function check() {
    const guess = input.trim().toLowerCase()
    if (!guess) { inputRef.current?.focus(); return }
    if (guess === w.word.toLowerCase()) {
      setFeedback('correct')
      setAnswered(true)
      onCorrect(w.word)
      speakWord(w.word)
    } else {
      setFeedback('wrong')
      setTimeout(() => {
        setFeedback(null)
        setInput('')
        inputRef.current?.focus()
      }, 1200)
    }
  }

  function reveal() {
    setRevealed(true)
    setAnswered(true)
    onWrong(w.word)
  }

  if (!w) return null

  return (
    <div className="guess-overlay open" id="guess-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="guess-modal">
        <div className="guess-top">
          <button className="guess-close" id="guess-close" onClick={onClose}>✕</button>
          <div className="guess-counter" id="guess-counter">{index + 1} / {total}</div>
        </div>

        <div className="guess-armenian" id="guess-armenian">
          {(w.meanings || []).join(', ') || '—'}
        </div>
        <div className="guess-phrases" id="guess-phrases">
          {(w.phrases || []).slice(0, 2).map(p => p.tr).join(' · ')}
        </div>

        <input
          ref={inputRef}
          className={`guess-input ${feedback === 'correct' ? 'state-correct' : feedback === 'wrong' ? 'state-wrong' : ''}`}
          id="guess-input"
          type="text"
          placeholder="Type the English word…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !answered && check()}
          disabled={answered}
          autoComplete="off"
          spellCheck="false"
        />

        {feedback === 'correct' && <div className="guess-feedback ok">✓ Correct!</div>}
        {feedback === 'wrong' && <div className="guess-feedback fail">✗ Not correct — try again</div>}

        {revealed && <div className="guess-answer-reveal show">{w.word}</div>}

        {answered && (
          <button className="guess-audio-btn show" id="guess-audio-btn" onClick={() => speakWord(w.word)}>
            🔊 Hear pronunciation
          </button>
        )}

        <div className="guess-bottom">
          <button className="guess-reveal-btn" id="guess-reveal" onClick={reveal} disabled={answered}>Show Answer</button>
          <button className="guess-check-btn" id="guess-check" onClick={check} disabled={answered}>Check ↵</button>
        </div>

        <div className="guess-nav">
          <button className="guess-nav-btn" id="guess-prev" disabled={index <= 0} onClick={onPrev}>← Prev</button>
          <span className="guess-nav-counter">{index + 1} / {total}</span>
          <button className="guess-nav-btn" id="guess-next" disabled={index >= total - 1} onClick={onNext}>Next →</button>
        </div>
      </div>
    </div>
  )
}
