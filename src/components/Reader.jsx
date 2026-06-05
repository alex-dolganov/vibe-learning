import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { ArrowLeft, ArrowRight, Check, Menu } from 'lucide-react'
import { courseData } from '../data/course'
import styles from './Reader.module.css'

const ACCENTS = ['blue', 'violet', 'amber', 'coral', 'teal']
const ACCENT_COLORS = {
  blue:   { dot: '#2f6af6', soft: '#edf1ff', ink: '#2f6af6' },
  violet: { dot: '#9b5fe6', soft: '#f2ecff', ink: '#9b5fe6' },
  amber:  { dot: '#f59e0b', soft: '#fff8e6', ink: '#b45309' },
  coral:  { dot: '#f0644c', soft: '#fef0ed', ink: '#f0644c' },
  teal:   { dot: '#14b8a6', soft: '#e6f9f7', ink: '#14b8a6' },
}

function getCompleted(userId) {
  const key = userId ? `vibecoder_progress_${userId}` : 'vibecoder_progress'
  const saved = localStorage.getItem(key)
  return saved ? JSON.parse(saved) : []
}

function saveCompleted(userId, arr) {
  const key = userId ? `vibecoder_progress_${userId}` : 'vibecoder_progress'
  localStorage.setItem(key, JSON.stringify(arr))
}

function getInitials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

export default function Reader({ user, userId, initialLesson, initialChapter, onBack }) {
  const [activeLesson, setActiveLesson] = useState(initialLesson)
  const [completed, setCompleted] = useState(() => getCompleted(userId))
  const [sideOpen, setSideOpen] = useState(false)

  const allLessons = courseData.flatMap(ch => ch.lessons.map(l => ({ ...l, chapter: ch })))
  const totalLessons = allLessons.length
  const progress = Math.round((completed.length / totalLessons) * 100)

  const currentIdx = allLessons.findIndex(l => l.id === activeLesson.id)
  const prevLesson = allLessons[currentIdx - 1] || null
  const nextLesson = allLessons[currentIdx + 1] || null

  const activeChapterIdx = courseData.findIndex(ch => ch.lessons.some(l => l.id === activeLesson.id))

  const markComplete = (id) => {
    if (!completed.includes(id)) {
      const next = [...completed, id]
      setCompleted(next)
      saveCompleted(userId, next)
    }
  }

  const goTo = (lesson) => {
    setActiveLesson(lesson)
    setSideOpen(false)
  }

  return (
    <div className={styles.reader}>
      {/* ── Header ── */}
      <header className={styles.top}>
        <button className={styles.iconBtn} onClick={onBack} title="Назад">
          <ArrowLeft size={18} strokeWidth={2} />
        </button>
        <div className={styles.topTitle}>
          <span className={styles.topTitleMain}>{courseData[activeChapterIdx]?.title}</span>
          <small>{activeChapterIdx + 1} глава · {activeLesson.title}</small>
        </div>
        <div className={styles.topProgress}>
          <div className={styles.topBar}>
            <motion.div className={styles.topBarFill}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }} />
          </div>
          <span className={styles.topPct}>{progress}%</span>
        </div>
        <button className={styles.iconBtn} onClick={() => setSideOpen(s => !s)} title="Содержание" style={{ display: 'none' }} aria-label="menu" data-hamb>
          <Menu size={18} strokeWidth={2} />
        </button>
        <div className={styles.topAvatar}>{getInitials(user.name)}</div>
      </header>

      <div className={styles.body}>
        {/* ── Sidebar ── */}
        <aside className={`${styles.side} ${sideOpen ? styles.sideOpen : ''}`}>
          {courseData.map((chapter, ci) => {
            const accent = ACCENTS[ci % ACCENTS.length]
            const color = ACCENT_COLORS[accent]
            return (
              <motion.div key={chapter.id} className={styles.chapGroup}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: ci * 0.06 }}>
                <div className={styles.chapHead}>
                  <div className={styles.chapDot} style={{ background: color.dot }} />
                  <span>Глава {chapter.id}</span>
                </div>
                {chapter.lessons.map(lesson => {
                  const isActive = lesson.id === activeLesson.id
                  const isDone = completed.includes(lesson.id)
                  return (
                    <button key={lesson.id}
                      className={`${styles.lessonBtn} ${isActive ? styles.lessonActive : ''}`}
                      onClick={() => goTo({ ...lesson, chapter })}>
                      <span className={`${styles.tick} ${isDone ? styles.tickDone : ''}`}>
                        {isDone ? <Check size={11} strokeWidth={2.5} /> : ''}
                      </span>
                      <span className={styles.lessonBtnTitle}>{lesson.title}</span>
                    </button>
                  )
                })}
              </motion.div>
            )
          })}
        </aside>

        {sideOpen && <div className={styles.sideBackdrop} onClick={() => setSideOpen(false)} />}

        {/* ── Main content ── */}
        <main className={styles.main}>
          <div className={styles.mainInner}>
            <AnimatePresence mode="wait">
              <motion.div key={activeLesson.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}>

                <div className={styles.meta}>
                  <div className={styles.metaDot}
                    style={{ background: ACCENT_COLORS[ACCENTS[activeChapterIdx % ACCENTS.length]].dot }} />
                  Глава {activeChapterIdx + 1} · Урок {currentIdx + 1}
                </div>

                <article className={styles.md}>
                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => <h1>{children}</h1>,
                      h2: ({ children }) => <h2>{children}</h2>,
                      h3: ({ children }) => <h3>{children}</h3>,
                      p: ({ children }) => <p>{children}</p>,
                      ul: ({ children }) => <ul>{children}</ul>,
                      ol: ({ children }) => <ol>{children}</ol>,
                      li: ({ children }) => <li>{children}</li>,
                      blockquote: ({ children }) => <blockquote>{children}</blockquote>,
                      code: ({ inline, children }) => inline
                        ? <code>{children}</code>
                        : <code className="block">{children}</code>,
                      pre: ({ children }) => <pre>{children}</pre>,
                      table: ({ children }) => <div className={styles.tableWrap}><table>{children}</table></div>,
                      th: ({ children }) => <th>{children}</th>,
                      td: ({ children }) => <td>{children}</td>,
                      strong: ({ children }) => <strong>{children}</strong>,
                    }}>
                    {activeLesson.content}
                  </ReactMarkdown>
                </article>

                <div className={styles.foot}>
                  {!completed.includes(activeLesson.id) ? (
                    <motion.button className={styles.doneBtn}
                      onClick={() => markComplete(activeLesson.id)}
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Check size={15} strokeWidth={2.5} /> Отметить как пройденное
                    </motion.button>
                  ) : (
                    <span className={styles.doneBadge}><Check size={14} strokeWidth={2.5} /> Пройдено</span>
                  )}

                  <div className={styles.nav}>
                    <button className={styles.navBtn}
                      onClick={() => prevLesson && goTo(prevLesson)}
                      disabled={!prevLesson}>
                      <ArrowLeft size={15} strokeWidth={2} /> Назад
                    </button>
                    {nextLesson && (
                      <motion.button className={styles.navBtnNext}
                        onClick={() => { markComplete(activeLesson.id); goTo(nextLesson) }}
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        {nextLesson.title} <ArrowRight size={15} strokeWidth={2} />
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  )
}
