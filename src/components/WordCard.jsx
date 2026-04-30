export default function WordCard({
  word: w, index, learned, starred, searchQuery,
  studyMode, dictationMode,
  onClick, onToggleLearned, onToggleStarred,
  speakWord, highlight,
}) {
  function speakAndGuess(e) {
    e.stopPropagation()
    speakWord(w.word)
  }

  if (dictationMode) {
    return (
      <div
        className={`word-card dictation-mode ${learned ? 'learned' : ''}`}
        style={{ animationDelay: `${index * 0.03}s` }}
      >
        <div className="card-word">{w.word}</div>
        <div className="card-meanings">{(w.meanings || []).slice(0, 2).join(' · ')}</div>
        <div className="card-footer">
          <div className="card-forms">{(w.forms || []).slice(0, 2).join(', ')}</div>
          <div className="card-actions">
            <button className="learn-toggle" title="Hear word" onClick={speakAndGuess} style={{ fontSize: 16, width: 32, height: 32 }}>🔊</button>
          </div>
        </div>
      </div>
    )
  }

  if (studyMode) {
    const armenian = (w.meanings || []).slice(0, 3).join(' · ') || '—'
    const phraseHint = (w.phrases || []).slice(0, 1).map(p => p.tr).join('')
    return (
      <div
        className={`word-card ${learned ? 'learned' : ''}`}
        style={{ animationDelay: `${index * 0.03}s` }}
        onClick={() => onClick(w.word)}
      >
        <div className="card-forms" style={{ fontSize: 11, marginBottom: 5, color: 'var(--accent)', fontStyle: 'normal' }}>🇦🇲 Armenian</div>
        <div className="card-armenian-text">{armenian}</div>
        <div className="card-study-hint">{phraseHint || 'Click to guess'}</div>
        <div className="card-footer">
          <div className="card-forms">{learned ? '✓ Learned' : 'Not learned'}</div>
          <div className="card-actions">
            <button
              className={`star-toggle ${starred ? 'active' : ''}`}
              title={starred ? 'Unstar' : 'Star'}
              onClick={e => { e.stopPropagation(); onToggleStarred(w.word) }}
            >{starred ? '⭐' : '☆'}</button>
            <button
              className="learn-toggle"
              title={learned ? 'Unmark' : 'Mark as learned'}
              onClick={e => { e.stopPropagation(); onToggleLearned(w.word) }}
            >{learned ? '✓' : '○'}</button>
          </div>
        </div>
      </div>
    )
  }

  const q = searchQuery
  return (
    <div
      className={`word-card ${learned ? 'learned' : ''}`}
      style={{ animationDelay: `${index * 0.03}s` }}
      onClick={() => onClick(w.word)}
    >
      {learned && <div className="card-learned-badge">✓ Learned</div>}
      <div className="card-word">{highlight(w.word, q)}</div>
      <div className="card-meanings">
        {(w.meanings || []).slice(0, 2).map((m, i) => (
          <span key={i}>{i > 0 && ' · '}{highlight(m, q)}</span>
        ))}
      </div>
      <div className="card-footer">
        <div className="card-forms">{(w.forms || []).slice(0, 2).join(', ')}</div>
        <div className="card-actions">
          <button
            className={`star-toggle ${starred ? 'active' : ''}`}
            title={starred ? 'Unstar' : 'Star'}
            onClick={e => { e.stopPropagation(); onToggleStarred(w.word) }}
          >{starred ? '⭐' : '☆'}</button>
          <button
            className="learn-toggle"
            title={learned ? 'Unmark' : 'Mark as learned'}
            onClick={e => { e.stopPropagation(); onToggleLearned(w.word) }}
          >{learned ? '✓' : '○'}</button>
        </div>
      </div>
    </div>
  )
}
