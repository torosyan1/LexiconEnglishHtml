export default function StatsBar({ streak, correct, wrong }) {
  const total = correct + wrong
  const accuracy = total > 0 ? Math.round(correct / total * 100) + '%' : null
  const show = streak > 0 || correct > 0

  if (!show) return null

  return (
    <div className="stats-bar" id="stats-bar">
      <div className="stats-inner">
        {streak > 0 && (
          <div className="stat-item" id="stat-streak-item">
            🔥 <span className="stat-value" id="stat-streak">{streak}</span> day streak
          </div>
        )}
        <div className="stat-item">
          ✅ <span className="stat-value" id="stat-today">{correct}</span> correct today
        </div>
        {accuracy && (
          <div className="stat-item" id="stat-accuracy-item">
            📊 <span className="stat-value" id="stat-accuracy">{accuracy}</span> accuracy
          </div>
        )}
      </div>
    </div>
  )
}
