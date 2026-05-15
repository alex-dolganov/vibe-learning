import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import LessonContent from './LessonContent'
import { courseData } from '../data/course'
import styles from './CourseLayout.module.css'

export default function CourseLayout({ user, onReset }) {
  const [activeLesson, setActiveLesson] = useState(courseData[0].lessons[0])
  const [completed, setCompleted] = useState(() => {
    const saved = localStorage.getItem('vibecoder_progress')
    return saved ? JSON.parse(saved) : []
  })
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const totalLessons = courseData.reduce((acc, ch) => acc + ch.lessons.length, 0)
  const progress = Math.round((completed.length / totalLessons) * 100)

  const markComplete = (lessonId) => {
    if (!completed.includes(lessonId)) {
      const next = [...completed, lessonId]
      setCompleted(next)
      localStorage.setItem('vibecoder_progress', JSON.stringify(next))
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
            <span />
            <span />
            <span />
          </button>
          <div className={styles.logo}>
            <span className={styles.logoName}>VibeCoder Academy</span>
          </div>
        </div>
        <div className={styles.headerCenter}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          </div>
          <span className={styles.progressLabel}>{progress}% пройдено</span>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.userName}>{user.name}</span>
          <button className={styles.resetBtn} onClick={onReset} title="Начать заново">
            ↩
          </button>
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
          <LessonContent
            lesson={activeLesson}
            isCompleted={completed.includes(activeLesson.id)}
            onComplete={() => markComplete(activeLesson.id)}
            onNext={nextLesson ? () => setActiveLesson(nextLesson) : null}
            onPrev={prevLesson ? () => setActiveLesson(prevLesson) : null}
            nextTitle={nextLesson?.title}
          />
        </main>
      </div>

      {sidebarOpen && (
        <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}
