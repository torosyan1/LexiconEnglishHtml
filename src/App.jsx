import { useState, useEffect, useCallback, useMemo } from 'react'
import SplashScreen from './components/SplashScreen.jsx'
import Header from './components/Header.jsx'
import Toolbar from './components/Toolbar.jsx'
import StatsBar from './components/StatsBar.jsx'
import WordGrid from './components/WordGrid.jsx'
import WordFocusOverlay from './components/WordFocusOverlay.jsx'
import CarMode from './components/CarMode.jsx'
import TestSetup from './components/TestSetup.jsx'
import TestPage from './components/TestPage.jsx'
import GuessOverlay from './components/GuessOverlay.jsx'
import ToastContainer from './components/ToastContainer.jsx'
import AchievementsOverlay from './components/AchievementsOverlay.jsx'
import ActivityCalendar from './components/ActivityCalendar.jsx'

const PER_PAGE = 60

function ls(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) ?? 'null') ?? fallback }
  catch { return fallback }
}
function lsSet(key, val) { localStorage.setItem(key, JSON.stringify(val)) }

const ACHIEVEMENTS = [
  { id: 'first', title: 'First Step', desc: 'Learned your first word!', icon: '🌱', check: (l) => Object.keys(l).length >= 1 },
  { id: 'ten', title: 'Ten Words', desc: 'Learned 10 words', icon: '🔟', check: (l) => Object.keys(l).length >= 10 },
  { id: 'fifty', title: 'Fifty!', desc: 'Learned 50 words', icon: '🎯', check: (l) => Object.keys(l).length >= 50 },
  { id: 'hundred', title: 'Century!', desc: 'Learned 100 words', icon: '💯', check: (l) => Object.keys(l).length >= 100 },
  { id: 'streak3', title: '3-Day Streak', desc: '3 days in a row', icon: '🔥', check: (_, s) => s.count >= 3 },
  { id: 'streak7', title: 'Week Warrior', desc: '7-day streak', icon: '⚡', check: (_, s) => s.count >= 7 },
]

export default function App() {
  const [wordsData, setWordsData] = useState([])
  const [learnedMap, setLearnedMap] = useState(() => ls('lexicon_learned', {}))
  const [starredMap, setStarredMap] = useState(() => ls('lexicon_starred', {}))
  const [srsData, setSrsData] = useState(() => ls('lexicon_srs', {}))
  const [streakData, setStreakData] = useState(() => ls('lexicon_streak', { count: 0, lastDate: null }))
  const [sessionData, setSessionData] = useState(() => {
    const today = new Date().toISOString().slice(0, 10)
    const s = ls('lexicon_session', null)
    return (s && s.date === today) ? s : { date: today, correct: 0, wrong: 0 }
  })
  const [darkMode, setDarkMode] = useState(() => ls('lexicon_dark', false))
  const [username, setUsername] = useState(() => localStorage.getItem('lexicon_username') || '')
  const [showSplash, setShowSplash] = useState(() => !localStorage.getItem('lexicon_username'))

  const [filter, setFilter] = useState('all')
  const [sortMode, setSortMode] = useState('default')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [activeLetters, setActiveLetters] = useState(new Set(['A']))
  const [studyMode, setStudyMode] = useState(false)
  const [dictationMode, setDictationMode] = useState(false)
  const [shuffledList, setShuffledList] = useState([])

  const [focusWord, setFocusWord] = useState(null)
  const [focusIndex, setFocusIndex] = useState(0)
  const [focusFiltered, setFocusFiltered] = useState([])

  const [showCarMode, setShowCarMode] = useState(false)
  const [showTestSetup, setShowTestSetup] = useState(false)
  const [testWords, setTestWords] = useState(null)

  const [guessWord, setGuessWord] = useState(null)
  const [guessIndex, setGuessIndex] = useState(0)
  const [guessFiltered, setGuessFiltered] = useState([])

  const [toasts, setToasts] = useState([])
  const [showAchievements, setShowAchievements] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [activityMap, setActivityMap] = useState(() => ls('lexicon_activity', {}))
  const [unlockedAchievements, setUnlockedAchievements] = useState(() => ls('lexicon_achievements', {}))
  const [wotd, setWotd] = useState(null)
  const [notes, setNotes] = useState(() => ls('lexicon_notes', {}))

  useEffect(() => {
    fetch('/words.json').then(r => r.json()).then(data => {
      setWordsData(data)
      setShuffledList(shuffle(data))
      // Word of the day
      const key = new Date().toISOString().slice(0, 10)
      const saved = ls('lexicon_wotd', null)
      if (saved && saved.key === key) {
        setWotd(saved.word)
      } else {
        const w = data[Math.floor(Math.abs(hashCode(key)) % data.length)]
        if (w) {
          lsSet('lexicon_wotd', { key, word: w.word })
          setWotd(w.word)
        }
      }
    }).catch(() => {})
  }, [])

  useEffect(() => {
    document.body.classList.toggle('dark', darkMode)
    lsSet('lexicon_dark', darkMode)
  }, [darkMode])

  useEffect(() => { lsSet('lexicon_learned', learnedMap) }, [learnedMap])
  useEffect(() => { lsSet('lexicon_starred', starredMap) }, [starredMap])
  useEffect(() => { lsSet('lexicon_srs', srsData) }, [srsData])
  useEffect(() => { lsSet('lexicon_streak', streakData) }, [streakData])
  useEffect(() => { lsSet('lexicon_session', sessionData) }, [sessionData])
  useEffect(() => { lsSet('lexicon_achievements', unlockedAchievements) }, [unlockedAchievements])
  useEffect(() => { lsSet('lexicon_notes', notes) }, [notes])
  useEffect(() => { lsSet('lexicon_activity', activityMap) }, [activityMap])

  function recordActivity() {
    const today = new Date().toISOString().slice(0, 10)
    setActivityMap(prev => ({ ...prev, [today]: (prev[today] || 0) + 1 }))
  }

  function hashCode(str) {
    let h = 0
    for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0
    return h
  }

  function shuffle(arr) {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }

  const toggleLearned = useCallback((word) => {
    setLearnedMap(prev => {
      const next = { ...prev }
      if (next[word]) delete next[word]
      else next[word] = true
      checkAchievements(next, streakData)
      return next
    })
  }, [streakData])

  const toggleStarred = useCallback((word) => {
    setStarredMap(prev => {
      const next = { ...prev }
      if (next[word]) delete next[next[word] ? word : word]
      if (prev[word]) delete next[word]
      else next[word] = true
      return next
    })
  }, [])

  function checkAchievements(lm, sd) {
    const lmToCheck = lm || learnedMap
    const sdToCheck = sd || streakData
    ACHIEVEMENTS.forEach(a => {
      if (!unlockedAchievements[a.id] && a.check(lmToCheck, sdToCheck)) {
        setUnlockedAchievements(prev => ({ ...prev, [a.id]: Date.now() }))
        showToast({ icon: a.icon, title: a.title, msg: a.desc, type: 'achievement' })
      }
    })
  }

  function showToast({ icon, title, msg, type = '' }) {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, icon, title, msg, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }

  function speakWord(word) {
    if (!word || !('speechSynthesis' in window)) return
    speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(word)
    utt.lang = 'en-US'
    utt.rate = 0.85
    speechSynthesis.speak(utt)
  }

  function updateStreak() {
    const today = new Date().toISOString().slice(0, 10)
    if (streakData.lastDate === today) return
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
    const newStreak = {
      count: streakData.lastDate === yesterday ? (streakData.count || 0) + 1 : 1,
      lastDate: today,
    }
    setStreakData(newStreak)
    checkAchievements(learnedMap, newStreak)
  }

  function recordAnswer(correct) {
    if (correct) recordActivity()
    setSessionData(prev => ({
      ...prev,
      correct: correct ? prev.correct + 1 : prev.correct,
      wrong: correct ? prev.wrong : prev.wrong + 1,
    }))
  }

  function srsUpdate(word, correct) {
    setSrsData(prev => {
      const d = { ...(prev[word] || { interval: 1, reps: 0, ef: 2.5 }) }
      if (correct) {
        d.reps = (d.reps || 0) + 1
        if (d.reps === 1) d.interval = 1
        else if (d.reps === 2) d.interval = 4
        else d.interval = Math.round((d.interval || 1) * (d.ef || 2.5))
        d.ef = Math.max(1.3, (d.ef || 2.5) + 0.1)
      } else {
        d.reps = 0; d.interval = 1
        d.ef = Math.max(1.3, (d.ef || 2.5) - 0.2)
      }
      d.nextReview = Date.now() + d.interval * 86400000
      d.lastAnswered = Date.now()
      return { ...prev, [word]: d }
    })
  }

  function getSRSLabel(word) {
    const d = srsData[word]
    if (!d) return null
    const now = Date.now()
    if (d.nextReview <= now) return 'Due for review'
    const days = Math.round((d.nextReview - now) / 86400000)
    return `Next review: ${days === 1 ? 'tomorrow' : `in ${days} days`}`
  }

  function isDue(word) {
    const d = srsData[word]
    return !!(d && d.nextReview <= Date.now())
  }

  const getFiltered = useCallback(() => {
    const q = searchQuery.toLowerCase()
    let list = wordsData.filter(w => {
      if (filter === 'learned' && !learnedMap[w.word]) return false
      if (filter === 'notlearned' && learnedMap[w.word]) return false
      if (filter === 'starred' && !starredMap[w.word]) return false
      if (!q) return true
      if (w.word.toLowerCase().includes(q)) return true
      if (w.meanings?.some(m => m.toLowerCase().includes(q))) return true
      if (w.phrases?.some(p => p.p?.toLowerCase().includes(q) || p.tr?.toLowerCase().includes(q))) return true
      return false
    })
    if (activeLetters.size) list = list.filter(w => w.word && activeLetters.has(w.word[0].toUpperCase()))
    if (sortMode === 'az') list = [...list].sort((a, b) => a.word.localeCompare(b.word))
    else if (sortMode === 'za') list = [...list].sort((a, b) => b.word.localeCompare(a.word))
    else if (sortMode === 'learned') list = [...list].sort((a, b) => (learnedMap[b.word] ? 1 : 0) - (learnedMap[a.word] ? 1 : 0))
    else if (sortMode === 'notlearned') list = [...list].sort((a, b) => (learnedMap[a.word] ? 1 : 0) - (learnedMap[b.word] ? 1 : 0))
    else if (sortMode === 'starred') list = [...list].sort((a, b) => (starredMap[b.word] ? 1 : 0) - (starredMap[a.word] ? 1 : 0))
    else if (sortMode === 'shuffle') list = shuffledList.filter(w => list.includes(w))
    return list
  }, [wordsData, filter, searchQuery, activeLetters, sortMode, learnedMap, starredMap, shuffledList])

  const filtered = useMemo(() => getFiltered(), [getFiltered])

  const learned = useMemo(() => Object.keys(learnedMap).length, [learnedMap])
  const total = wordsData.length
  const pct = total ? Math.round(learned / total * 100) : 0

  function openWordFocus(idx) {
    setFocusFiltered(filtered)
    setFocusIndex(idx)
    setFocusWord(filtered[idx])
  }

  function handleToggleLearned(word) {
    toggleLearned(word)
    if (focusWord?.word === word) {
      setFocusWord(prev => prev ? { ...prev } : prev)
    }
  }

  function openGuessMode(idx) {
    setGuessFiltered(filtered)
    setGuessIndex(idx)
    setGuessWord(filtered[idx])
  }

  function handleSortChange(val) {
    setSortMode(val)
    if (val === 'shuffle') setShuffledList(shuffle(wordsData))
    setCurrentPage(1)
  }

  function resetProgress() {
    if (!confirm('Reset all learned words?')) return
    setLearnedMap({})
  }

  const wotdWord = useMemo(() => wordsData.find(w => w.word === wotd), [wordsData, wotd])

  return (
    <>
      {showSplash && (
        <SplashScreen
          onStart={(name) => {
            localStorage.setItem('lexicon_username', name)
            setUsername(name)
            setShowSplash(false)
          }}
        />
      )}

      {showCarMode && (
        <CarMode
          words={wordsData}
          learnedMap={learnedMap}
          onToggleLearned={handleToggleLearned}
          onClose={() => setShowCarMode(false)}
          speakWord={speakWord}
        />
      )}

      {testWords && (
        <TestPage
          words={testWords}
          onClose={() => setTestWords(null)}
          onAnswer={(correct, word) => {
            recordAnswer(correct)
            updateStreak()
            srsUpdate(word, correct)
            if (correct && !learnedMap[word]) toggleLearned(word)
          }}
        />
      )}

      {guessWord && (
        <GuessOverlay
          word={guessWord}
          index={guessIndex}
          total={guessFiltered.length}
          onClose={() => setGuessWord(null)}
          onPrev={() => {
            if (guessIndex > 0) {
              setGuessIndex(i => i - 1)
              setGuessWord(guessFiltered[guessIndex - 1])
            }
          }}
          onNext={() => {
            if (guessIndex < guessFiltered.length - 1) {
              setGuessIndex(i => i + 1)
              setGuessWord(guessFiltered[guessIndex + 1])
            }
          }}
          onCorrect={(word) => {
            srsUpdate(word, true)
            recordAnswer(true)
            updateStreak()
            if (!learnedMap[word]) toggleLearned(word)
          }}
          onWrong={(word) => {
            srsUpdate(word, false)
            recordAnswer(false)
          }}
          speakWord={speakWord}
        />
      )}

      {showAchievements && (
        <AchievementsOverlay
          achievements={ACHIEVEMENTS}
          unlocked={unlockedAchievements}
          onClose={() => setShowAchievements(false)}
        />
      )}

      {showCalendar && (
        <ActivityCalendar
          activityMap={activityMap}
          onClose={() => setShowCalendar(false)}
        />
      )}

      <Header
        username={username}
        onUsernameClick={() => setShowSplash(true)}
        learned={learned}
        total={total}
        pct={pct}
        darkMode={darkMode}
        onToggleDark={() => setDarkMode(d => !d)}
        onReset={resetProgress}
        onOpenAchievements={() => setShowAchievements(true)}
        onOpenCalendar={() => setShowCalendar(true)}
      />

      <Toolbar
        searchQuery={searchQuery}
        onSearch={(q) => { setSearchQuery(q); setCurrentPage(1) }}
        filter={filter}
        onFilter={(f) => { setFilter(f); setCurrentPage(1) }}
        sortMode={sortMode}
        onSort={handleSortChange}
        studyMode={studyMode}
        onToggleStudy={() => {
          setStudyMode(m => !m)
          if (!studyMode && dictationMode) setDictationMode(false)
          setCurrentPage(1)
        }}
        dictationMode={dictationMode}
        onToggleDictation={() => {
          setDictationMode(m => !m)
          if (!dictationMode && studyMode) setStudyMode(false)
          setCurrentPage(1)
        }}
        onOpenTest={() => setShowTestSetup(true)}
        onOpenCar={() => setShowCarMode(true)}
        wordsData={wordsData}
        activeLetters={activeLetters}
        onLetterFilter={(l) => {
          setActiveLetters(prev => {
            if (l === 'ALL') return new Set()
            if (prev.size === 1 && prev.has(l)) return new Set()
            return new Set([l])
          })
          setCurrentPage(1)
        }}
        learnedMap={learnedMap}
        starredMap={starredMap}
      />

      <StatsBar streak={streakData.count} correct={sessionData.correct} wrong={sessionData.wrong} />

      <main className="main">
        {wotdWord && !searchQuery && filter === 'all' && currentPage === 1 && (activeLetters.size === 0 || activeLetters.has(wotdWord.word[0]?.toUpperCase())) && (
          <div className="wotd-banner" onClick={() => openWordFocus(filtered.findIndex(w => w.word === wotdWord.word))}>
            <div className="wotd-icon">✨</div>
            <div className="wotd-content">
              <div className="wotd-label">Word of the Day</div>
              <div className="wotd-word">{wotdWord.word}</div>
              <div className="wotd-meaning">{(wotdWord.meanings || []).slice(0, 2).join(' · ')}</div>
            </div>
            <div className="wotd-cta">Explore →</div>
          </div>
        )}

        <WordGrid
          words={filtered}
          currentPage={currentPage}
          perPage={PER_PAGE}
          learnedMap={learnedMap}
          starredMap={starredMap}
          searchQuery={searchQuery}
          studyMode={studyMode}
          dictationMode={dictationMode}
          onCardClick={(_word, idx) => {
            if (studyMode) openGuessMode(idx)
            else openWordFocus(idx)
          }}
          onToggleLearned={handleToggleLearned}
          onToggleStarred={toggleStarred}
          onPageChange={(p) => { setCurrentPage(p); window.scrollTo({ top: 130, behavior: 'smooth' }) }}
          speakWord={speakWord}
        />
      </main>

      {focusWord && (
        <WordFocusOverlay
          word={focusWord}
          index={focusIndex}
          total={focusFiltered.length}
          isLearned={!!learnedMap[focusWord.word]}
          isStarred={!!starredMap[focusWord.word]}
          srsLabel={getSRSLabel(focusWord.word)}
          isDue={isDue(focusWord.word)}
          note={notes[focusWord.word] || ''}
          onClose={() => setFocusWord(null)}
          onPrev={() => {
            if (focusIndex > 0) {
              const i = focusIndex - 1
              setFocusIndex(i)
              setFocusWord(focusFiltered[i])
            }
          }}
          onNext={() => {
            if (focusIndex < focusFiltered.length - 1) {
              const i = focusIndex + 1
              setFocusIndex(i)
              setFocusWord(focusFiltered[i])
            }
          }}
          onToggleLearned={() => handleToggleLearned(focusWord.word)}
          onToggleStarred={() => toggleStarred(focusWord.word)}
          onSaveNote={(word, text) => setNotes(prev => ({ ...prev, [word]: text }))}
          speakWord={speakWord}
        />
      )}

      {showTestSetup && (
        <TestSetup
          wordsData={wordsData}
          learnedMap={learnedMap}
          starredMap={starredMap}
          onClose={() => setShowTestSetup(false)}
          onStart={(words) => { setShowTestSetup(false); setTestWords(words) }}
        />
      )}

      <ToastContainer toasts={toasts} />
    </>
  )
}
