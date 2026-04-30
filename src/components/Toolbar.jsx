import { useRef, useEffect } from 'react'

export default function Toolbar({
  searchQuery, onSearch,
  filter, onFilter,
  sortMode, onSort,
  studyMode, onToggleStudy,
  dictationMode, onToggleDictation,
  onOpenTest, onOpenCar,
  wordsData, activeLetters, onLetterFilter,
  learnedMap, starredMap,
}) {
  const searchRef = useRef(null)

  useEffect(() => {
    function update() {
      const h = document.querySelector('.header')
      if (h) document.documentElement.style.setProperty('--header-h', h.offsetHeight + 'px')
    }
    update()
    const ro = new ResizeObserver(update)
    const h = document.querySelector('.header')
    if (h) ro.observe(h)
    return () => ro.disconnect()
  }, [])

  const available = new Set(wordsData.map(w => w.word?.[0]?.toUpperCase()).filter(Boolean))
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
  const allActive = activeLetters.size === 0

  return (
    <>
      <div className="toolbar">
        <div className="toolbar-inner">

          {/* Search — direct child of toolbar-inner */}
          <div className="search-wrap">
            <span className="search-icon">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="8.5" cy="8.5" r="5.5"/><path d="M15.5 15.5l-3.5-3.5"/>
              </svg>
            </span>
            <input
              ref={searchRef}
              className="search-input"
              id="search-input"
              type="text"
              placeholder="Search words, meanings, phrases…"
              value={searchQuery}
              onChange={e => onSearch(e.target.value)}
            />
            {searchQuery && (
              <button className="search-clear visible" id="search-clear" tabIndex={-1} onClick={() => { onSearch(''); searchRef.current?.focus() }}>
                <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M2 2l6 6M8 2l-6 6"/>
                </svg>
              </button>
            )}
          </div>

          {/* Filter + Sort selects */}
          <div className="filter-sort-row">
            <select className="sort-select" id="filter-select" value={filter} onChange={e => onFilter(e.target.value)}>
              <option value="all">All words</option>
              <option value="learned">✓ Learned</option>
              <option value="notlearned">✗ Not Yet</option>
              <option value="starred">★ Starred</option>
            </select>
            <select className="sort-select" id="sort-select" value={sortMode} onChange={e => onSort(e.target.value)}>
              <option value="default">Default order</option>
              <option value="az">A → Z</option>
              <option value="za">Z → A</option>
              <option value="learned">Learned first</option>
              <option value="notlearned">Not learned first</option>
              <option value="starred">Starred first</option>
              <option value="shuffle">Shuffle</option>
            </select>
          </div>

          <div className="toolbar-divider" />

          {/* Mode buttons */}
          <div className="mode-btns-row">
            <button
              className={`study-mode-btn ${studyMode ? 'active' : ''}`}
              id="study-btn"
              onClick={onToggleStudy}
              title="Study Mode — guess words from Armenian"
            >
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="14" height="12" rx="2"/><path d="M3 8h14"/><path d="M7 4v4"/>
              </svg>
              Study
            </button>

            <button
              className={`study-mode-btn ${dictationMode ? 'active' : ''}`}
              id="dictation-btn"
              onClick={onToggleDictation}
              title="Dictation Mode — hear and type"
            >
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v-2a6 6 0 0 1 12 0v2"/><rect x="2" y="11.5" width="3" height="5" rx="1.5"/><rect x="15" y="11.5" width="3" height="5" rx="1.5"/>
              </svg>
              Dictation
            </button>

            <button
              className="study-mode-btn btn-primary"
              id="test-btn"
              onClick={onOpenTest}
              title="Test Your Knowledge"
            >
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 2L4 11h6l-1 7 7-9h-6z"/>
              </svg>
              Test
            </button>

            <button
              className="study-mode-btn"
              id="car-mode-btn"
              onClick={onOpenCar}
              title="Auto-play words with pronunciation — great for listening in the car"
            >
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="8" width="16" height="8" rx="2"/>
                <path d="M5 8V6a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v2"/>
                <circle cx="6" cy="16" r="1.5" fill="currentColor" stroke="none"/>
                <circle cx="14" cy="16" r="1.5" fill="currentColor" stroke="none"/>
              </svg>
              Car Mode
            </button>
          </div>

        </div>
      </div>

      {/* Letter filter bar */}
      {wordsData.length > 0 && (
        <div className="letter-bar" id="letter-bar">
          <div className="letter-bar-inner" id="letter-bar-inner">
            <button
              className={`letter-btn ${allActive ? 'active' : ''}`}
              onClick={() => onLetterFilter('ALL')}
            >All</button>
            {alphabet.map(ch => (
              <button
                key={ch}
                className={`letter-btn ${activeLetters.has(ch) ? 'active' : ''}`}
                disabled={!available.has(ch)}
                onClick={() => onLetterFilter(ch)}
              >{ch}</button>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
