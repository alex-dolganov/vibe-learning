import { motion } from 'framer-motion'
import styles from './Sidebar.module.css'

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04, delayChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] } },
}

export default function Sidebar({ chapters, activeLesson, completed, onSelect, isOpen }) {
  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
      <motion.div
        className={styles.inner}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {chapters.map(chapter => (
          <div key={chapter.id} className={styles.chapter}>
            <motion.div className={styles.chapterHeader} variants={itemVariants}>
              <span className={styles.chapterTitle}>{chapter.title}</span>
            </motion.div>
            <ul className={styles.lessons}>
              {chapter.lessons.map(lesson => {
                const isActive = activeLesson.id === lesson.id
                const isDone = completed.includes(lesson.id)
                return (
                  <motion.li key={lesson.id} variants={itemVariants}>
                    <button
                      className={`${styles.lesson} ${isActive ? styles.lessonActive : ''} ${isDone ? styles.lessonDone : ''}`}
                      onClick={() => onSelect(lesson)}
                    >
                      <span className={styles.lessonCheck} />
                      <span className={styles.lessonTitle}>{lesson.title}</span>
                    </button>
                  </motion.li>
                )
              })}
            </ul>
          </div>
        ))}
      </motion.div>
    </aside>
  )
}
