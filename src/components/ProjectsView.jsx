import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, Pencil, Trash2, X, ExternalLink, FolderKanban } from 'lucide-react'
import {
  getProjects, createProject, updateProject, deleteProject,
  PROJECT_STATUSES, PROJECT_STATUS_LABELS,
} from '../lib/projects'
import styles from './ProjectsView.module.css'

const TECH_PALETTE = [
  '#7b9fd4', '#a98fc9', '#e0b87a', '#e09a8c', '#79bdb2',
  '#8bb0d6', '#c2a0d8', '#d8a36a', '#6f97d4', '#9ac4bb',
]

const STATUS_COLOR = {
  idea: '#a98fc9', active: '#7b9fd4', done: '#79bdb2', archived: '#9ba0b4',
}

function techColor(name) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return TECH_PALETTE[h % TECH_PALETTE.length]
}

const EMPTY_FORM = { name: '', description: '', stack: [], status: 'active', link: '' }

export default function ProjectsView({ userId }) {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(null)        // null | 'new' | project
  const [viewing, setViewing] = useState(null)        // null | project (детальный попап)
  const [form, setForm] = useState(EMPTY_FORM)
  const [tagInput, setTagInput] = useState('')

  useEffect(() => {
    let active = true
    getProjects()
      .then(({ data, error }) => {
        if (!active) return
        if (error) setError(error.message)
        else setProjects(data || [])
      })
      .catch(e => { if (active) setError(e?.message || String(e)) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [userId])

  const stats = useMemo(() => {
    const counts = {}
    for (const p of projects) for (const t of p.stack || []) counts[t] = (counts[t] || 0) + 1
    const total = Object.values(counts).reduce((a, b) => a + b, 0)
    const slices = Object.entries(counts)
      .map(([name, value]) => ({ name, value, pct: total ? Math.round((value / total) * 100) : 0, color: techColor(name) }))
      .sort((a, b) => b.value - a.value)
    return {
      total: projects.length,
      active: projects.filter(p => p.status === 'active').length,
      done: projects.filter(p => p.status === 'done').length,
      techCount: Object.keys(counts).length,
      topTech: slices[0]?.name || '—',
      slices,
      techTotal: total,
    }
  }, [projects])

  const openNew = () => { setForm(EMPTY_FORM); setTagInput(''); setEditing('new') }
  const openEdit = (p) => {
    setForm({ name: p.name, description: p.description, stack: [...(p.stack || [])], status: p.status, link: p.link || '' })
    setTagInput(''); setEditing(p)
  }
  const closeModal = () => { setEditing(null); setTagInput('') }

  const addTag = () => {
    const t = tagInput.trim()
    if (t && !form.stack.includes(t)) setForm(f => ({ ...f, stack: [...f.stack, t] }))
    setTagInput('')
  }
  const removeTag = (t) => setForm(f => ({ ...f, stack: f.stack.filter(x => x !== t) }))

  const save = async () => {
    const payload = { ...form, name: form.name.trim() || 'Без названия' }
    if (editing === 'new') {
      const { data, error } = await createProject(payload)
      if (error) { setError(error.message); return }
      setProjects(prev => [data, ...prev])
    } else {
      const { data, error } = await updateProject(editing.id, payload)
      if (error) { setError(error.message); return }
      setProjects(prev => prev.map(p => (p.id === data.id ? data : p)))
    }
    closeModal()
  }

  const remove = async (p) => {
    if (!window.confirm(`Удалить проект «${p.name}»?`)) return
    setProjects(prev => prev.filter(x => x.id !== p.id))
    closeModal()
    await deleteProject(p.id)
  }

  if (loading) return <div className={styles.state}>Загрузка проектов…</div>
  if (error) {
    return (
      <div className={styles.state}>
        <p className={styles.stateTitle}>Не удалось загрузить проекты</p>
        <p className={styles.stateSub}>{error}</p>
        <p className={styles.stateHint}>
          Похоже, таблица <code>projects</code> ещё не создана в Supabase. Примените SQL из
          <code> supabase/migrations/0001_notes_projects.sql</code>.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className={styles.head}>
        <div>
          <h1 className={styles.h1}>Мои проекты</h1>
          <p className={styles.sub}>Что я делаю и из чего это собрано.</p>
        </div>
        <button className={styles.addBtn} onClick={openNew}>
          <Plus size={16} strokeWidth={2.2} /> Новый проект
        </button>
      </div>

      {/* ── Stats ── */}
      <div className={styles.statsRow}>
        <div className={styles.chartCard}>
          <h3 className={styles.cardH}>Технологии</h3>
          {stats.techTotal === 0 ? (
            <p className={styles.chartEmpty}>Добавь проекты со стеком — здесь появится диаграмма.</p>
          ) : (
            <div className={styles.chartWrap}>
              <Donut slices={stats.slices} centerTop={stats.techCount} centerSub="технологий" />
              <ul className={styles.legend}>
                {stats.slices.slice(0, 7).map(s => (
                  <li key={s.name}>
                    <span className={styles.legendDot} style={{ background: s.color }} />
                    <span className={styles.legendName}>{s.name}</span>
                    <span className={styles.legendPct}>{s.pct}%</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className={styles.counters}>
          <Counter label="Проектов" value={stats.total} accent="#7b9fd4" />
          <Counter label="В работе" value={stats.active} accent="#a98fc9" />
          <Counter label="Готово" value={stats.done} accent="#79bdb2" />
          <Counter label="Топ-стек" value={stats.topTech} accent="#e0b87a" small />
        </div>
      </div>

      {/* ── Gallery ── */}
      {projects.length === 0 ? (
        <div className={styles.galleryEmpty}>
          <FolderKanban size={26} strokeWidth={1.6} />
          <p>Пока нет проектов</p>
          <button className={styles.addBtn} onClick={openNew}><Plus size={16} strokeWidth={2.2} /> Добавить первый</button>
        </div>
      ) : (
        <div className={styles.gallery}>
          {projects.map((p, i) => (
            <motion.div key={p.id} className={styles.projCard}
              onClick={() => setViewing(p)}
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ translateY: -3, boxShadow: '0 18px 34px -18px rgba(20,25,60,.3)' }}>
              <div className={styles.projTop}>
                <span className={styles.statusBadge} style={{ background: STATUS_COLOR[p.status] }}>
                  {PROJECT_STATUS_LABELS[p.status] || p.status}
                </span>
                <div className={styles.projActions} onClick={e => e.stopPropagation()}>
                  {p.link && (
                    <a href={p.link} target="_blank" rel="noreferrer" title="Открыть"><ExternalLink size={14} strokeWidth={2} /></a>
                  )}
                  <button onClick={() => openEdit(p)} title="Редактировать"><Pencil size={14} strokeWidth={2} /></button>
                  <button onClick={() => remove(p)} title="Удалить"><Trash2 size={14} strokeWidth={2} /></button>
                </div>
              </div>
              <h3 className={styles.projName}>{p.name}</h3>
              {p.description && <p className={styles.projDesc}>{p.description}</p>}
              {p.stack?.length > 0 && (
                <div className={styles.chips}>
                  {p.stack.map(t => (
                    <span key={t} className={styles.chip} style={{ background: `${techColor(t)}22`, color: techColor(t) }}>{t}</span>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Detail popup ── */}
      <AnimatePresence>
        {viewing && (
          <motion.div className={styles.overlay}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setViewing(null)}>
            <motion.div className={styles.modal}
              initial={{ opacity: 0, y: 20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              onClick={e => e.stopPropagation()}>
              <div className={styles.modalHead}>
                <span className={styles.statusBadge} style={{ background: STATUS_COLOR[viewing.status] }}>
                  {PROJECT_STATUS_LABELS[viewing.status] || viewing.status}
                </span>
                <button onClick={() => setViewing(null)}><X size={18} /></button>
              </div>

              <h2 className={styles.detailName}>{viewing.name}</h2>
              {viewing.description && <p className={styles.detailDesc}>{viewing.description}</p>}

              {viewing.stack?.length > 0 && (
                <div className={styles.chips} style={{ marginTop: 16 }}>
                  {viewing.stack.map(t => (
                    <span key={t} className={styles.chip} style={{ background: `${techColor(t)}22`, color: techColor(t) }}>{t}</span>
                  ))}
                </div>
              )}

              <div className={styles.detailFoot}>
                {viewing.link && (
                  <a className={styles.detailLink} href={viewing.link} target="_blank" rel="noreferrer">
                    Открыть <ExternalLink size={15} strokeWidth={2} />
                  </a>
                )}
                <button className={styles.modalCancel} style={{ marginLeft: 'auto' }}
                  onClick={() => { const p = viewing; setViewing(null); openEdit(p) }}>
                  <Pencil size={14} strokeWidth={2} /> Редактировать
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modal ── */}
      <AnimatePresence>
        {editing && (
          <motion.div className={styles.overlay}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={closeModal}>
            <motion.div className={styles.modal}
              initial={{ opacity: 0, y: 20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              onClick={e => e.stopPropagation()}>
              <div className={styles.modalHead}>
                <h2>{editing === 'new' ? 'Новый проект' : 'Редактировать проект'}</h2>
                <button onClick={closeModal}><X size={18} /></button>
              </div>

              <label className={styles.field}>
                <span>Название</span>
                <input value={form.name} autoFocus onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Build&Vibe" />
              </label>

              <label className={styles.field}>
                <span>Описание</span>
                <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Чем занимается проект…" />
              </label>

              <div className={styles.field}>
                <span>Стек</span>
                <div className={styles.tagBox}>
                  {form.stack.map(t => (
                    <span key={t} className={styles.tag} style={{ background: `${techColor(t)}22`, color: techColor(t) }}>
                      {t}<button onClick={() => removeTag(t)}><X size={11} strokeWidth={2.5} /></button>
                    </span>
                  ))}
                  <input
                    className={styles.tagInput}
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag() } }}
                    onBlur={addTag}
                    placeholder="React, Vite… (Enter)"
                  />
                </div>
              </div>

              <div className={styles.field}>
                <span>Статус</span>
                <div className={styles.statusRow}>
                  {PROJECT_STATUSES.map(s => (
                    <button key={s}
                      className={`${styles.statusOpt} ${form.status === s ? styles.statusOptActive : ''}`}
                      style={form.status === s ? { background: STATUS_COLOR[s], borderColor: STATUS_COLOR[s] } : {}}
                      onClick={() => setForm(f => ({ ...f, status: s }))}>
                      {PROJECT_STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>

              <label className={styles.field}>
                <span>Ссылка</span>
                <input value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} placeholder="https://github.com/…" />
              </label>

              <div className={styles.modalFoot}>
                {editing !== 'new' && (
                  <button className={styles.modalDelete} onClick={() => remove(editing)}>Удалить</button>
                )}
                <div className={styles.modalFootRight}>
                  <button className={styles.modalCancel} onClick={closeModal}>Отмена</button>
                  <button className={styles.modalSave} onClick={save}>Сохранить</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function Counter({ label, value, accent, small }) {
  return (
    <div className={styles.counter} style={{ '--ac': accent }}>
      <div className={`${styles.counterValue} ${small ? styles.counterSmall : ''}`}>{value}</div>
      <div className={styles.counterLabel}>{label}</div>
    </div>
  )
}

function Donut({ slices, centerTop, centerSub }) {
  const r = 52, stroke = 18, C = 2 * Math.PI * r
  let offset = 0
  return (
    <div className={styles.donut}>
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={r} fill="none" stroke="var(--line)" strokeWidth={stroke} />
        {slices.map(s => {
          const len = (s.value / slices.reduce((a, b) => a + b.value, 0)) * C
          const el = (
            <circle key={s.name} cx="70" cy="70" r={r} fill="none"
              stroke={s.color} strokeWidth={stroke}
              strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-offset}
              transform="rotate(-90 70 70)" />
          )
          offset += len
          return el
        })}
      </svg>
      <div className={styles.donutCenter}>
        <span className={styles.donutNum}>{centerTop}</span>
        <span className={styles.donutSub}>{centerSub}</span>
      </div>
    </div>
  )
}
