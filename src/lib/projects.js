// Доступ к проектам через Supabase. RLS ограничивает строки текущим юзером.
import { supabase } from './supabase'

export const PROJECT_STATUSES = ['idea', 'active', 'done', 'archived']

export const PROJECT_STATUS_LABELS = {
  idea: 'Идея',
  active: 'В работе',
  done: 'Готов',
  archived: 'В архиве',
}

export async function getProjects() {
  return supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })
}

export async function createProject(data) {
  return supabase
    .from('projects')
    .insert({
      name: data.name ?? '',
      description: data.description ?? '',
      stack: data.stack ?? [],
      status: data.status ?? 'active',
      link: data.link || null,
      color: data.color || null,
    })
    .select()
    .single()
}

export async function updateProject(id, patch) {
  return supabase
    .from('projects')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
}

export async function deleteProject(id) {
  return supabase.from('projects').delete().eq('id', id)
}
