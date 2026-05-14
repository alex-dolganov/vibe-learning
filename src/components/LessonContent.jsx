import ReactMarkdown from 'react-markdown'
import styles from './LessonContent.module.css'

export default function LessonContent({ lesson, isCompleted, onComplete, onNext, onPrev, nextTitle }) {
  return (
    <div className={styles.wrap}>
      <article className={styles.article}>
        <ReactMarkdown
          components={{
            h1: ({ children }) => <h1 className={styles.h1}>{children}</h1>,
            h2: ({ children }) => <h2 className={styles.h2}>{children}</h2>,
            h3: ({ children }) => <h3 className={styles.h3}>{children}</h3>,
            p: ({ children }) => <p className={styles.p}>{children}</p>,
            ul: ({ children }) => <ul className={styles.ul}>{children}</ul>,
            ol: ({ children }) => <ol className={styles.ol}>{children}</ol>,
            li: ({ children }) => <li className={styles.li}>{children}</li>,
            blockquote: ({ children }) => <blockquote className={styles.blockquote}>{children}</blockquote>,
            code: ({ inline, children }) =>
              inline
                ? <code className={styles.inlineCode}>{children}</code>
                : <code className={styles.codeBlock}>{children}</code>,
            pre: ({ children }) => <pre className={styles.pre}>{children}</pre>,
            table: ({ children }) => <div className={styles.tableWrap}><table className={styles.table}>{children}</table></div>,
            th: ({ children }) => <th className={styles.th}>{children}</th>,
            td: ({ children }) => <td className={styles.td}>{children}</td>,
            strong: ({ children }) => <strong className={styles.strong}>{children}</strong>,
            hr: () => <hr className={styles.hr} />,
          }}
        >
          {lesson.content}
        </ReactMarkdown>
      </article>

      <div className={styles.footer}>
        {!isCompleted && (
          <button className={styles.completeBtn} onClick={onComplete}>
            Отметить как пройденное ✓
          </button>
        )}
        {isCompleted && (
          <span className={styles.completedBadge}>✓ Пройдено</span>
        )}

        <div className={styles.nav}>
          <button
            className={styles.navBtn}
            onClick={onPrev}
            disabled={!onPrev}
          >
            ← Назад
          </button>
          {onNext && (
            <button className={styles.navBtnNext} onClick={() => { onComplete(); onNext() }}>
              {nextTitle ? `${nextTitle} →` : 'Следующий урок →'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
