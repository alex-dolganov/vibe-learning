import { useState } from 'react'
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

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [customRole, setCustomRole] = useState('')
  const [goal, setGoal] = useState('')

  const finalRole = role === 'Другое' ? customRole : role

  const handleNext = () => {
    if (step === 1 && name.trim()) setStep(2)
    if (step === 2 && finalRole.trim()) setStep(3)
  }

  const handleStart = () => {
    if (goal.trim() || true) {
      onComplete({ name: name.trim(), role: finalRole.trim(), goal: goal.trim() })
    }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <span className={styles.logoText}>VibeCoder Academy</span>
        </div>

        {step === 1 && (
          <div className={styles.step}>
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
            <button
              className={styles.btn}
              onClick={handleNext}
              disabled={!name.trim()}
            >
              Продолжить →
            </button>
          </div>
        )}

        {step === 2 && (
          <div className={styles.step}>
            <h1 className={styles.title}>Привет, {name}!</h1>
            <p className={styles.subtitle}>Кем ты работаешь? Это поможет сделать обучение более точным.</p>
            <div className={styles.roleGrid}>
              {ROLES.map(r => (
                <button
                  key={r}
                  className={`${styles.roleBtn} ${role === r ? styles.roleBtnActive : ''}`}
                  onClick={() => setRole(r)}
                >
                  {r}
                </button>
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
            <button
              className={styles.btn}
              onClick={handleNext}
              disabled={!finalRole.trim()}
              style={{ marginTop: '20px' }}
            >
              Продолжить →
            </button>
          </div>
        )}

        {step === 3 && (
          <div className={styles.step}>
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
            <button className={styles.btn} onClick={handleStart}>
              Начать обучение →
            </button>
          </div>
        )}

        <div className={styles.steps}>
          {[1, 2, 3].map(n => (
            <div key={n} className={`${styles.dot} ${step >= n ? styles.dotActive : ''}`} />
          ))}
        </div>
      </div>
    </div>
  )
}
