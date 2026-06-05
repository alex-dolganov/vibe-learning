import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import Logo from './Logo'
import styles from './AuthPage.module.css'

const features = [
  { icon: '⚡', title: 'Без кода', desc: 'Понимай что происходит в IT-команде — без написания кода' },
  { icon: '🗺️', title: '5 модулей', desc: 'Git, API, архитектура, процессы разработки, AI-инструменты' },
  { icon: '🤝', title: 'Для команд', desc: 'PM, дизайнеры, менеджеры — говорите с разработчиками на одном языке' },
]

export default function AuthPage() {
  const [tab, setTab] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const reset = () => { setError(''); setSuccess('') }

  const handleEmail = async (e) => {
    e.preventDefault()
    setLoading('email')
    reset()
    const redirectTo = `${window.location.origin}${import.meta.env.BASE_URL}`
    const { error } = tab === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: redirectTo } })
    if (error) setError(errorText(error.message))
    else if (tab === 'register') setSuccess('Проверь почту — отправили ссылку для подтверждения')
    setLoading(null)
  }

  const handleOAuth = async (provider) => {
    setLoading(provider)
    reset()
    const redirectTo = `${window.location.origin}${import.meta.env.BASE_URL}`
    const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo } })
    if (error) { setError(errorText(error.message)); setLoading(null) }
  }

  return (
    <div className={styles.wrap}>
      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* ── Left promo ── */}
        <div className={styles.promo}>
          <div className={styles.logo}>
            <Logo size={34} variant="mono" className={styles.logoMark} />
            <div className={styles.logoName}>
              Build&Vibe
              <small>Понимай IT изнутри</small>
            </div>
          </div>

          <p className={styles.promoH}>
            Разбирайся в IT —<br />без написания кода
          </p>

          <p className={styles.promoSub}>
            Платформа для тех, кто работает в IT-командах и хочет понимать что происходит вокруг.
          </p>

          <div className={styles.promoPills}>
            {['15 уроков', '5 глав', 'На русском', 'Бесплатно'].map(p => (
              <span key={p} className={styles.pill}>{p}</span>
            ))}
          </div>

          <div className={styles.promoFeats}>
            {features.map(f => (
              <div key={f.title} className={styles.promoFeat}>
                <div className={styles.featIco}>{f.icon}</div>
                <div>
                  <p className={styles.featTitle}>{f.title}</p>
                  <p className={styles.featDesc}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right form ── */}
        <div className={styles.form}>
          <h2 className={styles.formH}>
            {tab === 'login' ? 'Добро пожаловать' : 'Создай аккаунт'}
          </h2>
          <p className={styles.formLead}>
            {tab === 'login' ? 'Войди чтобы продолжить обучение' : 'Это займёт меньше минуты'}
          </p>

          <div className={styles.oauthRow}>
            {[
              { provider: 'github', label: 'GitHub', icon: <GitHubIcon /> },
              { provider: 'google', label: 'Google', icon: <GoogleIcon /> },
            ].map(({ provider, label, icon }) => (
              <motion.button
                key={provider}
                className={styles.oauthBtn}
                onClick={() => handleOAuth(provider)}
                disabled={!!loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                {loading === provider ? <Spinner /> : icon}
                {label}
              </motion.button>
            ))}
          </div>

          <div className={styles.divider}><span>или через email</span></div>

          <form onSubmit={handleEmail}>
            <div className={styles.fields}>
              <div className={styles.field}>
                <label>Email</label>
                <input className={styles.input} type="email" placeholder="you@example.com"
                  value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
              </div>
              <div className={styles.field}>
                <label>Пароль</label>
                <input className={styles.input} type="password" placeholder="Минимум 6 символов"
                  value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
                  autoComplete={tab === 'login' ? 'current-password' : 'new-password'} />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div className={styles.errorMsg}
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                  {error}
                </motion.div>
              )}
              {success && (
                <motion.div className={styles.successMsg}
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                  {success}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button type="submit" className={styles.submitBtn} disabled={!!loading}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              {loading === 'email' && <Spinner />}
              {tab === 'login' ? 'Войти' : 'Создать аккаунт'}
            </motion.button>
          </form>

          <p className={styles.switchLine}>
            {tab === 'login' ? <>Нет аккаунта? <button className={styles.switchBtn} onClick={() => { setTab('register'); reset() }}>Зарегистрироваться</button></> : <>Уже есть аккаунт? <button className={styles.switchBtn} onClick={() => { setTab('login'); reset() }}>Войти</button></>}
          </p>
        </div>
      </motion.div>
    </div>
  )
}

function errorText(msg) {
  if (msg.includes('Invalid login')) return 'Неверный email или пароль'
  if (msg.includes('Email not confirmed')) return 'Подтверди email — письмо уже отправлено'
  if (msg.includes('already registered')) return 'Этот email уже зарегистрирован'
  if (msg.includes('Password should be')) return 'Пароль должен быть минимум 6 символов'
  return msg
}

function Spinner() {
  return <span className={styles.spinner} />
}

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}
