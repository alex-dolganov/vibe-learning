import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import styles from './Onboarding.module.css'

const ROLES = [
  'Product Manager',
  'Project Manager',
  'Designer',
  'Маркетолог',
  'Аналитик',
  'Менеджер по продажам',
  'Операционный менеджер',
  'HR',
  'CEO / Основатель',
  'Другое',
]

const stepVariants = {
  enter: (dir) => ({ opacity: 0, x: dir > 0 ? 32 : -32 }),
  center: { opacity: 1, x: 0 },
  exit: (dir) => ({ opacity: 0, x: dir > 0 ? -32 : 32 }),
}

export default function Onboarding({ onComplete, initialName = '' }) {
  const [step, setStep] = useState(1)
  const [dir, setDir] = useState(1)
  const [name, setName] = useState(initialName)
  const [role, setRole] = useState('')
  const [customRole, setCustomRole] = useState('')
  const [goal, setGoal] = useState('')

  const finalRole = role === 'Другое' ? customRole : role

  const handleNext = () => {
    if (step === 1 && name.trim()) { setDir(1); setStep(2) }
    if (step === 2 && finalRole.trim()) { setDir(1); setStep(3) }
  }

  const handleBack = () => {
    setDir(-1)
    setStep(s => s - 1)
  }

  const handleStart = () => {
    onComplete({ name: name.trim(), role: finalRole.trim(), goal: goal.trim() })
  }

  return (
    <div className={styles.wrap}>
      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className={styles.logo}>
          <div className={styles.logoMark}>VC</div>
          <span className={styles.logoText}>VibeCoder Academy</span>
        </div>

        <div className={styles.stepWrap}>
          <AnimatePresence mode="wait" custom={dir}>
            {step === 1 && (
              <motion.div
                key="step1"
                className={styles.step}
                custom={dir}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
              >
                <h1 className={styles.title}>Добро пожаловать</h1>
                <p className={styles.subtitle}>Платформа для тех, кто работает в IT, но не пишет код самостоятельно — и хочет разбираться в том, что происходит вокруг.</p>
                <div className={styles.field}>
                  <label className={styles.label}>Как тебя зовут?</label>
                  <input
                    className={styles.input}
                    type="text"
                    placeholder="Введи своё имя"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleNext()}
                    autoFocus
                  />
                </div>
                <motion.button
                  className={styles.btn}
                  onClick={handleNext}
                  disabled={!name.trim()}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  Продолжить →
                </motion.button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                className={styles.step}
                custom={dir}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
              >
                <h1 className={styles.title}>Привет, {name}!</h1>
                <p className={styles.subtitle}>Кем ты работаешь? Это поможет сделать обучение более точным.</p>
                <div className={styles.roleGrid}>
                  {ROLES.map((r, i) => (
                    <motion.button
                      key={r}
                      className={`${styles.roleBtn} ${role === r ? styles.roleBtnActive : ''}`}
                      onClick={() => setRole(r)}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.2 }}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                    >
                      {r}
                    </motion.button>
                  ))}
                </div>
                {role === 'Другое' && (
                  <input
                    className={styles.input}
                    type="text"
                    placeholder="Напиши свою должность"
                    value={customRole}
                    onChange={e => setCustomRole(e.target.value)}
                    autoFocus
                    style={{ marginTop: '12px' }}
                  />
                )}
                <div className={styles.btnRow}>
                  <button className={styles.btnBack} onClick={handleBack}>← Назад</button>
                  <motion.button
                    className={styles.btn}
                    onClick={handleNext}
                    disabled={!finalRole.trim()}
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  >
                    Продолжить →
                  </motion.button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                className={styles.step}
                custom={dir}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
              >
                <h1 className={styles.title}>Почти готово</h1>
                <p className={styles.subtitle}>Что для тебя самое важное — чему хочешь научиться в первую очередь?</p>
                <div className={styles.field}>
                  <label className={styles.label}>Твоя цель (необязательно)</label>
                  <textarea
                    className={styles.textarea}
                    placeholder="Например: хочу понимать что говорят разработчики на встречах, не переспрашивать каждый раз..."
                    value={goal}
                    onChange={e => setGoal(e.target.value)}
                    rows={3}
                    autoFocus
                  />
                </div>
                <div className={styles.btnRow}>
                  <button className={styles.btnBack} onClick={handleBack}>← Назад</button>
                  <motion.button
                    className={styles.btn}
                    onClick={handleStart}
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  >
                    Начать обучение →
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className={styles.steps}>
          {[1, 2, 3].map(n => (
            <motion.div
              key={n}
              className={`${styles.dot} ${step >= n ? styles.dotActive : ''}`}
              animate={{ scale: step === n ? 1.4 : 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  )
}
