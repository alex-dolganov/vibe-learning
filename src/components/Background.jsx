import styles from './Background.module.css'

export default function Background() {
  return (
    <div className={styles.bg}>
      <div className={styles.orb1} />
      <div className={styles.orb2} />
      <div className={styles.orb3} />
      <div className={styles.orb4} />
      <div className={styles.grid} />
    </div>
  )
}
