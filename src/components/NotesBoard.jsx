import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Check } from 'lucide-react'
import { getNotes, createNote, updateNote, deleteNote } from '../lib/notes'
import styles from './NotesBoard.module.css'

const COLUMNS = [
  { id: 'idea',  label: 'Идеи',     accent: '#a98fc9' },
  { id: 'doing', label: 'В работе', accent: '#7b9fd4' },
  { id: 'done',  label: 'Готово',   accent: '#79bdb2' },
]

const NOTE_COLORS = ['#7b9fd4', '#a98fc9', '#e0b87a', '#e09a8c', '#79bdb2']

export default function NotesBoard({ userId }) {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [draft, setDraft] = useState({ title: '', body: '' })
  const columnRefs = useRef({})

  useEffect(() => {
    let active = true
    getNotes()
      .then(({ data, error }) => {
        if (!active) return
        if (error) setError(error.message)
        else setNotes(data || [])
      })
      .catch(e => { if (active) setError(e?.message || String(e)) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [userId])

  const maxPosition = (status) =>
    notes.filter(n => n.status === status).reduce((m, n) => Math.max(m, n.position), 0)

  const addNote = async (status) => {
    const color = NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)]
    const { data, error } = await createNote({ status, position: maxPosition(status) + 1, color })
    if (error) { setError(error.message); return }
    setNotes(prev => [...prev, data])
    setDraft({ title: '', body: '' })
    setEditingId(data.id)
  }

  const saveEdit = async (id) => {
    const patch = { title: draft.title.trim(), body: draft.body.trim() }
    setNotes(prev => prev.map(n => (n.id === id ? { ...n, ...patch } : n)))
    setEditingId(null)
    await updateNote(id, patch)
  }

  const removeNote = async (id) => {
    setNotes(prev => prev.filter(n => n.id !== id))
    if (editingId === id) setEditingId(null)
    await deleteNote(id)
  }

  const moveNote = async (note, status) => {
    const position = maxPosition(status) + 1
    setNotes(prev => prev.map(n => (n.id === note.id ? { ...n, status, position } : n)))
    await updateNote(note.id, { status, position })
  }

  const handleDragEnd = (note, _e, info) => {
    const { x, y } = info.point
    for (const col of COLUMNS) {
      const el = columnRefs.current[col.id]
      if (!el) continue
      const r = el.getBoundingClientRect()
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
        if (col.id !== note.status) moveNote(note, col.id)
        return
      }
    }
  }

  if (loading) {
    return <div className={styles.state}>Загрузка заметок…</div>
  }

  if (error) {
    return (
      <div className={styles.state}>
        <p className={styles.stateTitle}>Не удалось загрузить заметки</p>
        <p className={styles.stateSub}>{error}</p>
        <p className={styles.stateHint}>
          Похоже, таблица <code>notes</code> ещё не создана в Supabase. Примените SQL из
          <code> supabase/migrations/0001_notes_projects.sql</code>.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className={styles.head}>
        <h1 className={styles.h1}>Заметки</h1>
        <p className={styles.sub}>Канбан-доска идей и задач. Перетаскивай карточки между колонками.</p>
      </div>

      <div className={styles.board}>
        {COLUMNS.map(col => {
          const items = notes
            .filter(n => n.status === col.id)
            .sort((a, b) => a.position - b.position || a.created_at.localeCompare(b.created_at))
          return (
            <div key={col.id} className={styles.column} ref={el => (columnRefs.current[col.id] = el)}>
              <div className={styles.colHead}>
                <span className={styles.colDot} style={{ background: col.accent }} />
                <span className={styles.colTitle}>{col.label}</span>
                <span className={styles.colCount}>{items.length}</span>
                <button className={styles.colAdd} onClick={() => addNote(col.id)} title="Добавить заметку">
                  <Plus size={16} strokeWidth={2.2} />
                </button>
              </div>

              <div className={styles.colList}>
                <AnimatePresence initial={false}>
                  {items.map(note => (
                    <motion.div
                      key={note.id}
                      layout
                      drag
                      dragSnapToOrigin
                      onDragEnd={(e, info) => handleDragEnd(note, e, info)}
                      whileDrag={{ scale: 1.04, zIndex: 50, boxShadow: '0 18px 40px -12px rgba(20,25,60,.35)', cursor: 'grabbing' }}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className={styles.card}
                      style={{ borderLeftColor: note.color || col.accent }}
                    >
                      {editingId === note.id ? (
                        <div className={styles.edit}>
                          <input
                            className={styles.editTitle}
                            placeholder="Заголовок"
                            value={draft.title}
                            autoFocus
                            onChange={e => setDraft(d => ({ ...d, title: e.target.value }))}
                            onKeyDown={e => { if (e.key === 'Enter') saveEdit(note.id) }}
                          />
                          <textarea
                            className={styles.editBody}
                            placeholder="Текст заметки…"
                            rows={3}
                            value={draft.body}
                            onChange={e => setDraft(d => ({ ...d, body: e.target.value }))}
                          />
                          <button className={styles.editSave} onClick={() => saveEdit(note.id)}>
                            <Check size={14} strokeWidth={2.4} /> Сохранить
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className={styles.cardTop}>
                            <div className={styles.cardTitle}>{note.title || 'Без названия'}</div>
                            <div className={styles.cardActions}>
                              <button onClick={() => { setDraft({ title: note.title, body: note.body }); setEditingId(note.id) }} title="Редактировать">
                                <Pencil size={13} strokeWidth={2} />
                              </button>
                              <button onClick={() => removeNote(note.id)} title="Удалить">
                                <Trash2 size={13} strokeWidth={2} />
                              </button>
                            </div>
                          </div>
                          {note.body && <div className={styles.cardBody}>{note.body}</div>}
                        </>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {items.length === 0 && (
                  <button className={styles.emptyAdd} onClick={() => addNote(col.id)}>
                    <Plus size={15} strokeWidth={2} /> Добавить
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
