// Активность пользователя для heatmap (GitHub-style).
// Хранится отдельно от прогресса: { "ГГГГ-ММ-ДД": число пройденных в этот день }.
// Существующие пройденные уроки (без дат) один раз засеваются на сегодня.

const activityKey = (userId) => userId ? `vibecoder_activity_${userId}` : 'vibecoder_activity'
const progressKey = (userId) => userId ? `vibecoder_progress_${userId}` : 'vibecoder_progress'

export function localDayKey(date = new Date()) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const tzAdjusted = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
  return tzAdjusted.toISOString().slice(0, 10)
}

function completedCount(userId) {
  const raw = localStorage.getItem(progressKey(userId))
  return raw ? JSON.parse(raw).length : 0
}

// Карта активности. Если её ещё нет — засеваем текущими пройденными уроками на сегодня.
export function getActivity(userId) {
  const raw = localStorage.getItem(activityKey(userId))
  if (raw) return JSON.parse(raw)
  const count = completedCount(userId)
  const seeded = count > 0 ? { [localDayKey()]: count } : {}
  localStorage.setItem(activityKey(userId), JSON.stringify(seeded))
  return seeded
}

// Отметить прохождение одного урока сегодня.
// completedArr — актуальный массив пройденных (уже включает новый урок), нужен
// для корректного «засева» истории, если карта активности ещё не создавалась.
export function recordCompletion(userId, completedArr) {
  const raw = localStorage.getItem(activityKey(userId))
  let activity
  if (!raw) {
    activity = { [localDayKey()]: completedArr.length }
  } else {
    activity = JSON.parse(raw)
    const today = localDayKey()
    activity[today] = (activity[today] || 0) + 1
  }
  localStorage.setItem(activityKey(userId), JSON.stringify(activity))
}
