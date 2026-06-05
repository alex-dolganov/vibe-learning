import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import styles from './Onboarding.module.css'

const ROLES = [
  'Product Manager', 'Project Manager', 'Designer', 'Маркетолог',
  'Аналитик', 'Менеджер по продажам', 'Операционный менеджер',
  'HR', 'CEO / Основатель', 'Другое',
]

const stepVariants = {
  enter: (dir) => ({ opacity: 0, x: dir > 0 ? 28 : -28 }),
  center: { opacity: 1, x: 0 },
  exit: (dir) => ({ opacity: 0, x: dir > 0 ? -28 : 28 }),
}

export default function Onboarding({ onComplete, initialName = '' }) {
  const [step, setStep] = useState(1)
  const [dir, setDir] = useState(1)
  const [name, setName] = useState(initialName)
  const [role, setRole] = useState('')
  const [customRole, setCustomRole] = useState('')
  const [goal, setGoal] = useState('')

  const finalRole = role === 'Другое' ? customRole : role

  const next = () => { setDir(1); setStep(s => s + 1) }
  const back = () => { setDir(-1); setStep(s => s - 1) }

  const handleStart = () => {
    onComplete({ name: name.trim(), role: finalRole.trim(), goal: goal.trim() })
  }

  return (
    <div className={styles.wrap}>
      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className={styles.logo}>
          <div className={styles.logoMark}>VC</div>
          <span className={styles.logoName}>VibeCoder Academy</span>
        </div>

        <div className={styles.stepWrap}>
          <AnimatePresence mode="wait" custom={dir}>
            {step === 1 && (
              <motion.div key="s1" className={styles.step}
                custom={dir} variants={stepVariants}
                initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.26, ease: [0.4, 0, 0.2, 1] }}>
                <p className={styles.stepLabel}>Шаг 1 из 3</p>
                <h2 className={styles.title}>Добро пожаловать!</h2>
                <p className={styles.lead}>Платформа для тех, кто работает в IT и хочет понимать что происходит вокруг.</p>
                <div className={styles.field}>
                  <label>Как тебя зовут?</label>
                  <input className={styles.input} type="text" placeholder="Введи своё имя"
                    value={name} onChange={e => setName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && name.trim() && next()} autoFocus />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="s2" className={styles.step}
                custom={dir} variants={stepVariants}
                initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.26, ease: [0.4, 0, 0.2, 1] }}>
                <p className={styles.stepLabel}>Шаг 2 из 3</p>
                <h2 className={styles.title}>Привет, {name}!</h2>
                <p className={styles.lead}>Кем ты работаешь? Это поможет сделать обучение точнее.</p>
                <div className={styles.roleGrid}>
                  {ROLES.map(r => (
                    <motion.button key={r}
                      className={`${styles.roleBtn} ${role === r ? styles.roleBtnActive : ''}`}
                      onClick={() => setRole(r)}
                      whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                      {r}
                    </motion.button>
                  ))}
                </div>
                {role === 'Другое' && (
                  <input className={styles.input} type="text" placeholder="Напиши свою должность"
                    value={customRole} onChange={e => setCustomRole(e.target.value)}
                    autoFocus style={{ marginTop: 12 }} />
                )}
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="s3" className={styles.step}
                custom={dir} variants={stepVariants}
                initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.26, ease: [0.4, 0, 0.2, 1] }}>
                <p className={styles.stepLabel}>Шаг 3 из 3</p>
                <h2 className={styles.title}>Почти готово</h2>
                <p className={styles.lead}>Что для тебя самое важное — чему хочешь научиться в первую очередь?</p>
                <div className={styles.field}>
                  <label>Твоя цель (необязательно)</label>
                  <textarea className={styles.input} rows={3}
                    placeholder="Например: хочу понимать что говорят разработчики на встречах..."
                    value={goal} onChange={e => setGoal(e.target.value)} autoFocus />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className={styles.nav}>
          <div className={styles.dots}>
            {[1, 2, 3].map(n => (
              <motion.div key={n}
                className={`${styles.dot} ${step >= n ? styles.dotActive : ''}`}
                animate={{ width: step === n ? 26 : 8 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }} />
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            {step > 1 && (
              <button className={styles.btnBack} onClick={back} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><ArrowLeft size={15} strokeWidth={2} /> Назад</button>
            )}
            {step < 3 && (
              <motion.button className={styles.btnNext}
                onClick={next}
                disabled={step === 1 ? !name.trim() : !finalRole.trim()}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>Продолжить <ArrowRight size={15} strokeWidth={2} /></span>
              </motion.button>
            )}
            {step === 3 && (
              <motion.button className={styles.btnNext}
                onClick={handleStart}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>Начать обучение <ArrowRight size={15} strokeWidth={2} /></span>
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
