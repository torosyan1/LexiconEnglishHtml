import WordCard from './WordCard.jsx'

function highlight(text, q) {
  if (!q || !text) return text
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'))
  return parts.map((p, i) =>
    p.toLowerCase() === q.toLowerCase()
      ? <span key={i} className="highlight">{p}</span>
      : p
  )
}

export default function WordGrid({
  words, currentPage, perPage,
  learnedMap, starredMap, searchQuery,
  studyMode, dictationMode,
  onCardClick, onToggleLearned, onToggleStarred,
  onPageChange, speakWord,
}) {
  const totalPages = Math.max(1, Math.ceil(words.length / perPage))
  const safePage = Math.min(currentPage, totalPages)
  const slice = words.slice((safePage - 1) * perPage, safePage * perPage)

  if (words.length === 0) {
    return (
      <div className="empty">
        <div className="empty-icon">📭</div>
        <h3>No words found</h3>
        <p>Try a different search or filter.</p>
      </div>
    )
  }

  return (
    <>
      <div className="results-info">{words.length} word{words.length !== 1 ? 's' : ''} found</div>
      <div className="word-grid">
        {slice.map((w, i) => (
          <WordCard
            key={w.word}
            word={w}
            index={i}
            learned={!!learnedMap[w.word]}
            starred={!!starredMap[w.word]}
            searchQuery={searchQuery}
            studyMode={studyMode}
            dictationMode={dictationMode}
            onClick={(word) => onCardClick(word, words.indexOf(w))}
            onToggleLearned={onToggleLearned}
            onToggleStarred={onToggleStarred}
            speakWord={speakWord}
            highlight={highlight}
          />
        ))}
      </div>
      {totalPages > 1 && (
        <div className="pagination">
          <button className="page-btn" disabled={safePage <= 1} onClick={() => onPageChange(safePage - 1)}>← Prev</button>
          <span className="page-info">Page {safePage} of {totalPages}</span>
          <button className="page-btn" disabled={safePage >= totalPages} onClick={() => onPageChange(safePage + 1)}>Next →</button>
        </div>
      )}
    </>
  )
}
