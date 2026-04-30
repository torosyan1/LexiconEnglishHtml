import { useEffect, useRef, useState } from 'react'

export default function WordFocusOverlay({
  word: w, index, total,
  isLearned, isStarred, srsLabel, isDue, note,
  onClose, onPrev, onNext,
  onToggleLearned, onToggleStarred, onSaveNote,
  speakWord,
}) {
  const [noteText, setNoteText] = useState(note || '')
  const [noteSaved, setNoteSaved] = useState(false)
  const bodyRef = useRef(null)

  useEffect(() => { setNoteText(note || '') }, [note, w?.word])
  useEffect(() => { document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = '' } }, [])
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onNext()
      if (e.key === 'ArrowLeft') onPrev()
      const tag = document.activeElement.tagName
      if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
        if (e.key === 'l' || e.key === 'L') onToggleLearned()
        if (e.key === 'p' || e.key === 'P') speakWord(w?.word)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [w, onClose, onPrev, onNext, onToggleLearned, speakWord])

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = 0
  }, [w?.word])

  if (!w) return null

  function saveNote() {
    onSaveNote(w.word, noteText)
    setNoteSaved(true)
    setTimeout(() => setNoteSaved(false), 2000)
  }

  return (
    <div className="wf-overlay open" id="wf-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="wf-top-bar">
        <button className="wf-close-btn" onClick={onClose}>✕</button>
        <span className="wf-counter">{index + 1} / {total}</span>
        <div style={{ width: 40 }} />
      </div>

      <div className="wf-body" ref={bodyRef} id="wf-body">
        {w.pos && <div className="wf-pos-tag">{w.pos}</div>}
        <div className="wf-word">{w.word}</div>
        <button className="wf-audio-btn" onClick={() => speakWord(w.word)}>🔊</button>

        {w.meanings?.length > 0 && (
          <div className="wf-meanings">
            {w.meanings.map((m, i) => <span key={i} className="wf-meaning-chip">{m}</span>)}
          </div>
        )}

        {w.usage?.length > 0 && (
          <div className="wf-usage">
            <div className="wf-section-label">Usage &amp; Examples</div>
            {w.usage.map((u, i) => (
              <div key={i} className="wf-usage-block">
                <span className="wf-usage-type">{u.type}</span>
                {u.examples?.map((ex, j) => (
                  <div key={j} className="wf-example-full">
                    <div className="wf-example-en">{ex.en}</div>
                    <div className="wf-example-hy">{ex.hy}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {w.phrases?.length > 0 && (
          <div className="wf-phrases">
            <div className="wf-section-label">Phrases</div>
            {w.phrases.map((ph, i) => (
              <div key={i} className="wf-phrase-row">
                <div className="wf-phrase-name">{ph.p}</div>
                <div className="wf-phrase-ex">{ph.ex}</div>
                <div className="wf-phrase-tr">{ph.tr}</div>
                {ph.hy && <div className="wf-phrase-ex-hy">{ph.hy}</div>}
              </div>
            ))}
          </div>
        )}

        {w.forms?.length > 0 && (
          <>
            <div className="wf-section-label" style={{ maxWidth: 660, width: '100%' }}>Word Forms</div>
            <div className="wf-forms">
              {w.forms.map((f, i) => <span key={i} className="wf-form-tag">{f}</span>)}
            </div>
          </>
        )}

        <div className="modal-section" style={{ maxWidth: 660, width: '100%' }}>
          <div className="section-label">My Note</div>
          <textarea
            className="note-textarea"
            placeholder="Add your own memory trick, example, or note…"
            value={noteText}
            onChange={e => { setNoteText(e.target.value); setNoteSaved(false) }}
          />
          <div className="note-save-row">
            <button className="note-save-btn" onClick={saveNote}>Save Note</button>
            {noteSaved && <span className="note-saved-msg">✓ Saved</span>}
          </div>
        </div>

        <div className="modal-action-row" style={{ maxWidth: 660, width: '100%' }}>
          <button
            className={`modal-star-btn ${isStarred ? 'is-starred' : ''}`}
            onClick={onToggleStarred}
          >{isStarred ? '⭐ Starred' : '☆ Star'}</button>
          <button
            className={`modal-learn-btn ${isLearned ? 'is-learned' : ''}`}
            onClick={onToggleLearned}
          >{isLearned ? '✓ Learned!' : '○ Mark as Learned'}</button>
        </div>

        {srsLabel && (
          <div className={`srs-info ${isDue ? 'due' : ''}`} style={{ maxWidth: 660, width: '100%' }}>
            {srsLabel}
          </div>
        )}
      </div>

      <div className="wf-bottom">
        <button className="wf-nav-btn" disabled={index <= 0} onClick={onPrev}>←</button>
        <button className={`wf-learn-btn ${isLearned ? 'is-learned' : ''}`} onClick={onToggleLearned}>
          {isLearned ? '✓ Learned!' : '○ Mark as Learned'}
        </button>
        <button className="wf-nav-btn" disabled={index >= total - 1} onClick={onNext}>→</button>
      </div>
    </div>
  )
}
