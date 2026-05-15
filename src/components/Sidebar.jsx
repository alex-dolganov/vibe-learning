import styles from './Sidebar.module.css'

export default function Sidebar({ chapters, activeLesson, completed, onSelect, isOpen }) {
  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
      <div className={styles.inner}>
        {chapters.map(chapter => (
          <div key={chapter.id} className={styles.chapter}>
            <div className={styles.chapterHeader}>
              <span className={styles.chapterTitle}>{chapter.title}</span>
            </div>
            <ul className={styles.lessons}>
              {chapter.lessons.map(lesson => {
                const isActive = activeLesson.id === lesson.id
                const isDone = completed.includes(lesson.id)
                return (
                  <li key={lesson.id}>
                    <button
                      className={`${styles.lesson} ${isActive ? styles.lessonActive : ''} ${isDone ? styles.lessonDone : ''}`}
                      onClick={() => onSelect(lesson)}
                    >
                      <span className={styles.lessonCheck} />
                      <span className={styles.lessonTitle}>{lesson.title}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  )
}
