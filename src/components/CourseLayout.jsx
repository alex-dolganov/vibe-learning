import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Sidebar from './Sidebar'
import LessonContent from './LessonContent'
import { courseData } from '../data/course'
import styles from './CourseLayout.module.css'

export default function CourseLayout({ user, userId, onReset, onLogout }) {
  const [activeLesson, setActiveLesson] = useState(courseData[0].lessons[0])
  const [completed, setCompleted] = useState(() => {
    const key = userId ? `vibecoder_progress_${userId}` : 'vibecoder_progress'
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : []
  })
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const totalLessons = courseData.reduce((acc, ch) => acc + ch.lessons.length, 0)
  const progress = Math.round((completed.length / totalLessons) * 100)

  const markComplete = (lessonId) => {
    if (!completed.includes(lessonId)) {
      const next = [...completed, lessonId]
      setCompleted(next)
      const key = userId ? `vibecoder_progress_${userId}` : 'vibecoder_progress'
      localStorage.setItem(key, JSON.stringify(next))
    }
  }

  const allLessons = courseData.flatMap(ch => ch.lessons)
  const currentIndex = allLessons.findIndex(l => l.id === activeLesson.id)
  const nextLesson = allLessons[currentIndex + 1] || null
  const prevLesson = allLessons[currentIndex - 1] || null

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.menuBtn} onClick={() => setSidebarOpen(!sidebarOpen)}>
            <span /><span /><span />
          </button>
          <div className={styles.logo}>
            <span className={styles.logoName}>VibeCoder Academy</span>
          </div>
        </div>

        <div className={styles.headerCenter}>
          <div className={styles.progressBar}>
            <motion.div
              className={styles.progressFill}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className={styles.progressLabel}>{progress}% пройдено</span>
        </div>

        <div className={styles.headerRight}>
          <span className={styles.userName}>{user.name}</span>
          <button className={styles.resetBtn} onClick={onReset} title="Начать заново">↩</button>
          <button className={styles.logoutBtn} onClick={onLogout} title="Выйти">Выйти</button>
        </div>
      </header>

      <div className={`${styles.body} ${sidebarOpen ? styles.sidebarVisible : ''}`}>
        <Sidebar
          chapters={courseData}
          activeLesson={activeLesson}
          completed={completed}
          isOpen={sidebarOpen}
          onSelect={(lesson) => {
            setActiveLesson(lesson)
            setSidebarOpen(false)
          }}
        />
        <main className={styles.main}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeLesson.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            >
              <LessonContent
                lesson={activeLesson}
                isCompleted={completed.includes(activeLesson.id)}
                onComplete={() => markComplete(activeLesson.id)}
                onNext={nextLesson ? () => setActiveLesson(nextLesson) : null}
                onPrev={prevLesson ? () => setActiveLesson(prevLesson) : null}
                nextTitle={nextLesson?.title}
              />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {sidebarOpen && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
