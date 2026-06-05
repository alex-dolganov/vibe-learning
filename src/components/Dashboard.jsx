import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Home, BarChart3, User, Trophy,
  Flag, Layers, GitBranch, MessageSquare, Bot,
  Zap, Flame, Lock, PartyPopper,
  ArrowRight, RotateCcw,
} from 'lucide-react'
import { courseData } from '../data/course'
import Logo from './Logo'
import styles from './Dashboard.module.css'

const ACCENTS = ['blue', 'violet', 'amber', 'coral', 'teal']
const CHAPTER_ICONS = [Flag, Layers, GitBranch, MessageSquare, Bot]
const ACCENT_COLORS = {
  blue:   { bg: '#2f6af6', text: '#fff', bar: 'rgba(255,255,255,.32)', fill: '#fff', soft: '#edf1ff', ink: '#2f6af6' },
  violet: { bg: '#9b5fe6', text: '#fff', bar: 'rgba(255,255,255,.32)', fill: '#fff', soft: '#f2ecff', ink: '#9b5fe6' },
  amber:  { bg: '#f59e0b', text: '#3d2e00', bar: 'rgba(0,0,0,.12)', fill: '#3d2e00', soft: '#fff8e6', ink: '#b45309' },
  coral:  { bg: '#f0644c', text: '#fff', bar: 'rgba(255,255,255,.32)', fill: '#fff', soft: '#fef0ed', ink: '#f0644c' },
  teal:   { bg: '#14b8a6', text: '#fff', bar: 'rgba(255,255,255,.32)', fill: '#fff', soft: '#e6f9f7', ink: '#14b8a6' },
}

const NAV = [
  { id: 'home',         Icon: Home,     label: 'Главная' },
  { id: 'progress',     Icon: BarChart3, label: 'Прогресс' },
  { id: 'profile',      Icon: User,      label: 'Профиль' },
  { id: 'achievements', Icon: Trophy,    label: 'Достижения' },
]

const TOTAL_LESSONS = courseData.reduce((a, c) => a + c.lessons.length, 0)

const ACHIEVEMENTS = [
  { id: 'first',  Icon: Zap,        title: 'Первый шаг',    desc: 'Пройди первый урок',              check: (c) => c.length >= 1 },
  { id: 'half',   Icon: Flame,      title: 'На полпути',    desc: 'Пройди 50% курса',                check: (c) => c.length >= Math.ceil(TOTAL_LESSONS * 0.5) },
  { id: 'git',    Icon: GitBranch,  title: 'Git-гуру',      desc: 'Завершить главу про Git',         check: (c) => courseData[2].lessons.every(l => c.includes(l.id)) },
  { id: 'vibe',   Icon: Bot,        title: 'Вайбкодер',     desc: 'Пройти весь курс',                check: (c) => c.length >= TOTAL_LESSONS },
]

const DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']

function getCompleted(userId) {
  const key = userId ? `vibecoder_progress_${userId}` : 'vibecoder_progress'
  const saved = localStorage.getItem(key)
  return saved ? JSON.parse(saved) : []
}

function chapterProgress(chapter, completed) {
  const done = chapter.lessons.filter(l => completed.includes(l.id)).length
  return { done, total: chapter.lessons.length, pct: Math.round((done / chapter.lessons.length) * 100) }
}

function getInitials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function getTodayLabel() {
  return new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })
}

export default function Dashboard({ user, userId, onLogout, onReset, onOpenLesson }) {
  const [activeNav, setActiveNav] = useState('home')
  const completed = getCompleted(userId)
  const totalLessons = courseData.reduce((a, c) => a + c.lessons.length, 0)
  const totalPct = Math.round((completed.length / totalLessons) * 100)

  const allLessons = courseData.flatMap(ch => ch.lessons.map(l => ({ ...l, chapter: ch })))
  const nextLessons = allLessons.filter(l => !completed.includes(l.id)).slice(0, 3)

  return (
    <div className={styles.shell}>
      {/* ── Left sidebar ── */}
      <aside className={styles.side}>
        <div className={styles.logo}>
          <Logo size={32} variant="color" className={styles.logoMark} />
          <div className={styles.logoName}>Build&Vibe</div>
        </div>

        <nav className={styles.navList}>
          {NAV.map(item => (
            <motion.button key={item.id}
              className={`${styles.navItem} ${activeNav === item.id ? styles.navActive : ''}`}
              onClick={() => setActiveNav(item.id)}
              whileHover={activeNav !== item.id ? { backgroundColor: 'var(--panel-2)' } : {}}
              whileTap={{ scale: 0.98 }}>
              <span className={styles.navIco}><item.Icon size={18} strokeWidth={1.8} /></span>
              <span>{item.label}</span>
            </motion.button>
          ))}
        </nav>

        <div className={styles.sideCard}>
          <p className={styles.sideCardLabel}>Прогресс курса</p>
          <div className={styles.sideCardBig}>
            {completed.length}<span>/ {totalLessons}</span>
          </div>
          <p className={styles.sideCardSub}>уроков пройдено</p>
          <motion.button className={styles.sideCardCta}
            onClick={() => {
              const next = allLessons.find(l => !completed.includes(l.id))
              if (next) onOpenLesson(next, next.chapter)
            }}
            whileHover={{ translateX: 3 }} whileTap={{ scale: 0.96 }}>
            <ArrowRight size={18} strokeWidth={2} />
          </motion.button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className={styles.main}>
        {activeNav === 'home' && <HomeView user={user} completed={completed} onOpenLesson={onOpenLesson} />}
        {activeNav === 'progress' && <ProgressView completed={completed} />}
        {activeNav === 'profile' && <ProfileView user={user} onReset={onReset} onLogout={onLogout} totalPct={totalPct} />}
        {activeNav === 'achievements' && <AchievementsView completed={completed} />}
      </main>

      {/* ── Right column ── */}
      <aside className={styles.rightCol}>
        <div className={styles.userChip}>
          <div>
            <div className={styles.userChipName}>{user.name}</div>
            <div className={styles.userChipRole}>{user.role}</div>
          </div>
          <div className={styles.avatar}>{getInitials(user.name)}</div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionH}>Продолжи обучение</h3>
          <div className={styles.continueList}>
            {nextLessons.length === 0
              ? <p style={{ color: 'var(--ink-3)', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}><PartyPopper size={16} /> Курс пройден!</p>
              : nextLessons.map((lesson, i) => {
                  const chIdx = courseData.findIndex(ch => ch.id === lesson.chapter.id)
                  const accent = ACCENTS[chIdx % ACCENTS.length]
                  const color = ACCENT_COLORS[accent]
                  const prog = chapterProgress(lesson.chapter, completed)
                  return (
                    <motion.div key={lesson.id} className={styles.continueItem}
                      onClick={() => onOpenLesson(lesson, lesson.chapter)}
                      whileHover={{ backgroundColor: 'var(--panel-2)' }}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}>
                      <div className={styles.continueIco} style={{ background: color.soft, color: color.ink }}>
                        {(() => { const ChIco = CHAPTER_ICONS[chIdx]; return <ChIco size={16} strokeWidth={1.7} /> })()}
                      </div>
                      <div className={styles.continueTx}>
                        <div className={styles.continueName}>{lesson.title}</div>
                        <div className={styles.continueChap}>{lesson.chapter.title}</div>
                      </div>
                      <Ring pct={prog.pct} color={color.ink} />
                    </motion.div>
                  )
                })
            }
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionH}>Недельный план</h3>
          <WeeklyPlan completed={completed} onOpenLesson={onOpenLesson} />
        </div>
      </aside>
    </div>
  )
}

/* ── Home view ── */
function HomeView({ user, completed, onOpenLesson }) {
  return (
    <>
      <div className={styles.mainHead}>
        <div>
          <h1 className={styles.mainH1}>Привет, {user.name}!</h1>
          <div className={styles.mainDate}>{getTodayLabel()}</div>
        </div>
      </div>

      <div className={styles.rowHead}>
        <h2 className={styles.sectionH}>Главы курса</h2>
      </div>

      <div className={styles.chapterList}>
        {courseData.map((chapter, i) => {
          const accent = ACCENTS[i % ACCENTS.length]
          const color = ACCENT_COLORS[accent]
          const prog = chapterProgress(chapter, completed)
          const firstIncomplete = chapter.lessons.find(l => !completed.includes(l.id)) || chapter.lessons[0]
          return (
            <motion.div key={chapter.id}
              className={styles.chCard}
              style={{ '--ac': color.bg, '--ac-text': color.text, '--ac-bar': color.bar, '--ac-fill': color.fill }}
              onClick={() => onOpenLesson(firstIncomplete, chapter)}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              whileHover={{ translateY: -3, boxShadow: `0 22px 38px -18px var(--ac)` }}
              whileTap={{ scale: 0.99 }}>
              <div className={styles.chTop}>
                <div className={styles.chIco}>{(() => { const ChIco = CHAPTER_ICONS[i]; return <ChIco size={22} strokeWidth={1.7} /> })()}</div>
                <div className={styles.chBadge}>
                  <b>{prog.done}</b>
                  <small>/ {prog.total}</small>
                </div>
              </div>
              <div className={styles.chNum}>Глава {chapter.id}</div>
              <div className={styles.chTitle}>{chapter.title}</div>
              <div className={styles.chFoot}>
                <div className={styles.chBar}>
                  <motion.div className={styles.chBarFill}
                    initial={{ width: 0 }}
                    animate={{ width: `${prog.pct}%` }}
                    transition={{ delay: i * 0.07 + 0.3, duration: 0.6, ease: [0.34, 1.4, 0.5, 1] }} />
                </div>
                <span className={styles.chOpen} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>Открыть <ArrowRight size={14} strokeWidth={2} /></span>
              </div>
            </motion.div>
          )
        })}
      </div>
    </>
  )
}

/* ── Progress view ── */
function ProgressView({ completed }) {
  const total = courseData.reduce((a, c) => a + c.lessons.length, 0)
  const pct = Math.round((completed.length / total) * 100)
  return (
    <>
      <div className={styles.mainHead}>
        <h1 className={styles.mainH1}>Мой прогресс</h1>
      </div>
      <div className={styles.progressOverall}>
        <div className={styles.progressOverallNum}>{pct}%</div>
        <div className={styles.progressOverallLabel}>общий прогресс · {completed.length} из {total} уроков</div>
        <div className={styles.progressOverallBar}>
          <motion.div className={styles.progressOverallFill}
            initial={{ width: 0 }} animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: [0.34, 1.2, 0.5, 1] }} />
        </div>
      </div>
      <div className={styles.chapterList}>
        {courseData.map((chapter, i) => {
          const accent = ACCENTS[i % ACCENTS.length]
          const color = ACCENT_COLORS[accent]
          const prog = chapterProgress(chapter, completed)
          return (
            <div key={chapter.id} className={styles.progressChap}>
              <div className={styles.progressChapHead}>
                <span className={styles.progressChapIco} style={{ background: color.soft, color: color.ink }}>{(() => { const ChIco = CHAPTER_ICONS[i]; return <ChIco size={16} strokeWidth={1.7} /> })()}</span>
                <span className={styles.progressChapTitle}>{chapter.title}</span>
                <span className={styles.progressChapPct} style={{ color: color.ink }}>{prog.pct}%</span>
              </div>
              <div className={styles.progressBar}>
                <motion.div className={styles.progressBarFill}
                  style={{ background: color.bg }}
                  initial={{ width: 0 }} animate={{ width: `${prog.pct}%` }}
                  transition={{ delay: i * 0.1, duration: 0.6, ease: [0.34, 1.4, 0.5, 1] }} />
              </div>
              <div className={styles.lessonDots}>
                {chapter.lessons.map(l => (
                  <div key={l.id} className={styles.lessonDot}
                    style={{ background: completed.includes(l.id) ? color.bg : 'var(--line-2)' }}
                    title={l.title} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

/* ── Profile view ── */
function ProfileView({ user, onReset, onLogout, totalPct }) {
  return (
    <>
      <div className={styles.mainHead}>
        <h1 className={styles.mainH1}>Профиль</h1>
      </div>
      <div className={styles.profileCard}>
        <div className={styles.profileAvatar}>{getInitials(user.name)}</div>
        <div className={styles.profileName}>{user.name}</div>
        <div className={styles.profileRole}>{user.role}</div>
        {user.goal && <p className={styles.profileGoal}>«{user.goal}»</p>}
        <div className={styles.profileStat}>
          <div className={styles.profileStatNum}>{totalPct}%</div>
          <div className={styles.profileStatLabel}>курса пройдено</div>
        </div>
        <div className={styles.profileBtns}>
          <button className={styles.profileBtnGhost} onClick={onReset} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><RotateCcw size={14} strokeWidth={2} /> Начать заново</button>
          <button className={styles.profileBtnGhost} onClick={onLogout}>Выйти</button>
        </div>
      </div>
    </>
  )
}

/* ── Achievements view ── */
function AchievementsView({ completed }) {
  return (
    <>
      <div className={styles.mainHead}>
        <h1 className={styles.mainH1}>Достижения</h1>
      </div>
      <div className={styles.achieveGrid}>
        {ACHIEVEMENTS.map((a, i) => {
          const unlocked = a.check(completed)
          return (
            <motion.div key={a.id}
              className={`${styles.achieveCard} ${unlocked ? styles.achieveUnlocked : ''}`}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}>
              <div className={styles.achieveIco}>{unlocked ? <a.Icon size={28} strokeWidth={1.6} /> : <Lock size={28} strokeWidth={1.6} />}</div>
              <div className={styles.achieveTitle}>{a.title}</div>
              <div className={styles.achieveDesc}>{a.desc}</div>
            </motion.div>
          )
        })}
      </div>
    </>
  )
}

/* ── Ring SVG ── */
function Ring({ pct, color }) {
  const r = 16, c = 2 * Math.PI * r
  return (
    <div className={styles.ring}>
      <svg width="44" height="44" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r={r} fill="none" stroke="var(--line-2)" strokeWidth="3" />
        <circle cx="22" cy="22" r={r} fill="none" stroke={color} strokeWidth="3"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (pct / 100) * c}
          transform="rotate(-90 22 22)" />
      </svg>
      <span style={{ color }}>{pct}%</span>
    </div>
  )
}

/* ── Weekly plan ── */
function WeeklyPlan({ completed, onOpenLesson }) {
  const allLessons = courseData.flatMap((ch, ci) => ch.lessons.map(l => ({ ...l, chapter: ch, chIdx: ci })))
  const planSlots = []
  DAYS.forEach((day, di) => {
    const lesson = allLessons[di * 2 + 1] || allLessons[di]
    if (lesson) {
      const color = ACCENT_COLORS[ACCENTS[lesson.chIdx % ACCENTS.length]]
      planSlots.push({ day, dayIdx: di, lesson, color, done: completed.includes(lesson.id) })
    }
  })

  return (
    <div className={styles.plan}>
      <div className={styles.planDays}>
        {DAYS.map(d => <div key={d} className={styles.planDay}>{d}</div>)}
      </div>
      <div className={styles.planGrid}>
        {DAYS.map((_, di) => {
          const slot = planSlots.find(s => s.dayIdx === di)
          return (
            <div key={di} className={styles.planCell}>
              {slot && (
                <motion.div className={styles.planEv}
                  style={{
                    background: slot.done ? slot.color.bg : slot.color.soft,
                    color: slot.done ? slot.color.text : slot.color.ink,
                  }}
                  onClick={() => onOpenLesson(slot.lesson, slot.lesson.chapter)}
                  whileHover={{ scale: 1.04 }} title={slot.lesson.title}>
                  <span>{slot.lesson.title.slice(0, 14)}</span>
                </motion.div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
