import { useState, useMemo } from 'react'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function TestSetup({ wordsData, learnedMap, starredMap, onClose, onStart }) {
  const [wordSet, setWordSet] = useState('learned')
  const [letter, setLetter] = useState('all')
  const [count, setCount] = useState('all')
  const [customCount, setCustomCount] = useState('')

  const candidates = useMemo(() => {
    let list = wordsData
    if (wordSet === 'learned') list = list.filter(w => learnedMap[w.word])
    else if (wordSet === 'notlearned') list = list.filter(w => !learnedMap[w.word])
    else if (wordSet === 'starred') list = list.filter(w => starredMap[w.word])
    if (letter !== 'all') list = list.filter(w => w.word?.[0]?.toUpperCase() === letter)
    return list
  }, [wordsData, learnedMap, starredMap, wordSet, letter])

  const available = useMemo(() => {
    let base = wordsData
    if (wordSet === 'learned') base = base.filter(w => learnedMap[w.word])
    else if (wordSet === 'notlearned') base = base.filter(w => !learnedMap[w.word])
    else if (wordSet === 'starred') base = base.filter(w => starredMap[w.word])
    return new Set(base.map(w => w.word?.[0]?.toUpperCase()).filter(Boolean))
  }, [wordsData, learnedMap, starredMap, wordSet])

  const finalCount = useMemo(() => {
    if (count === 'all') return candidates.length
    if (count === 'custom') return Math.min(parseInt(customCount) || 0, candidates.length)
    return Math.min(parseInt(count), candidates.length)
  }, [candidates.length, count, customCount])

  function start() {
    if (finalCount < 1) return
    let words = shuffle(candidates)
    if (count !== 'all') words = words.slice(0, finalCount)
    onStart(words)
  }

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
  const wordSets = [
    { value: 'learned', label: '✅ Learned' },
    { value: 'notlearned', label: '📖 Not Learned' },
    { value: 'starred', label: '⭐ Starred' },
    { value: 'all', label: '🔀 All Words' },
  ]
  const counts = ['all', '10', '25', '50', '100', 'custom']

  return (
    <div className="test-setup-overlay open" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="test-setup-modal">
        <div className="test-setup-header">
          <div className="test-setup-title">🧪 Test Your Knowledge</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="test-setup-body">
          <div className="test-setup-section">
            <div className="test-setup-section-label">1. Which words to test?</div>
            <div className="test-setup-chips">
              {wordSets.map(ws => (
                <button
                  key={ws.value}
                  className={`setup-chip ${wordSet === ws.value ? 'active' : ''}`}
                  onClick={() => { setWordSet(ws.value); setLetter('all') }}
                >{ws.label}</button>
              ))}
            </div>
          </div>

          <div className="test-setup-section">
            <div className="test-setup-section-label">
              2. Filter by first letter <span style={{ fontWeight: 400, color: 'var(--text-light)', fontSize: 12 }}>(optional)</span>
            </div>
            <div className="test-setup-letter-wrap">
              <button
                className={`setup-letter-btn ${letter === 'all' ? 'active' : ''}`}
                onClick={() => setLetter('all')}
              >All</button>
              {alphabet.map(ch => (
                <button
                  key={ch}
                  className={`setup-letter-btn ${letter === ch ? 'active' : ''}`}
                  disabled={!available.has(ch)}
                  onClick={() => setLetter(ch)}
                >{ch}</button>
              ))}
            </div>
          </div>

          <div className="test-setup-section">
            <div className="test-setup-section-label">3. How many words?</div>
            <div className="test-setup-chips">
              {counts.map(c => (
                <button
                  key={c}
                  className={`setup-chip ${count === c ? 'active' : ''}`}
                  disabled={c !== 'all' && c !== 'custom' && parseInt(c) > candidates.length}
                  onClick={() => setCount(c)}
                >{c === 'all' ? 'All' : c === 'custom' ? 'Custom…' : c}</button>
              ))}
            </div>
            {count === 'custom' && (
              <div className="test-setup-custom-wrap">
                <input
                  type="number"
                  className="test-setup-custom-input"
                  placeholder="e.g. 75"
                  min="1"
                  max={candidates.length}
                  value={customCount}
                  onChange={e => setCustomCount(e.target.value)}
                />
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>words</span>
              </div>
            )}
          </div>

          <div className="test-setup-info">
            {candidates.length === 0
              ? 'No words match your selection.'
              : `${finalCount} word${finalCount !== 1 ? 's' : ''} will be tested.`}
          </div>

          <div className="test-setup-actions">
            <button className="test-setup-cancel" onClick={onClose}>Cancel</button>
            <button className="test-setup-start" disabled={finalCount < 1} onClick={start}>Start Test →</button>
          </div>
        </div>
      </div>
    </div>
  )
}
