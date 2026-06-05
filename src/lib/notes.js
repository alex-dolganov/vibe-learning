// Доступ к заметкам (канбан) через Supabase. RLS сам ограничивает строки текущим юзером,
// поэтому user_id в запросах указывать не нужно (дефолтится auth.uid() при insert).
import { supabase } from './supabase'

export const NOTE_STATUSES = ['idea', 'doing', 'done']

export async function getNotes() {
  return supabase
    .from('notes')
    .select('*')
    .order('status', { ascending: true })
    .order('position', { ascending: true })
    .order('created_at', { ascending: true })
}

export async function createNote({ status = 'idea', position = 0, color = null } = {}) {
  return supabase
    .from('notes')
    .insert({ status, position, color, title: '', body: '' })
    .select()
    .single()
}

export async function updateNote(id, patch) {
  return supabase
    .from('notes')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
}

export async function deleteNote(id) {
  return supabase.from('notes').delete().eq('id', id)
}
