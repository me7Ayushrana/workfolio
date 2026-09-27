import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabaseAdmin: SupabaseClient | null = null

export function getSupabaseAdmin(): SupabaseClient | null {
  if (supabaseAdmin) return supabaseAdmin

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://zleptvsyivwhnoqipibu.supabase.co'
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_DQq7sZhHN45jgsQczLMtoA_QghzvEeB'

  if (url && serviceKey) {
    try {
      supabaseAdmin = createClient(url, serviceKey, {
        auth: { persistSession: false }
      })
      return supabaseAdmin
    } catch {
      return null
    }
  }
  return null
}

export interface UserDataStore {
  userProfile: any
  projects: any[]
  activities: any[]
  skills: any[]
  learningTracks: any[]
  goals: any[]
  evidence: any[]
  capabilities: any[]
  problems: any[]
}

/**
 * Fetch all user entities from Supabase PostgreSQL (or return empty defaults for clean production state)
 */
export async function fetchUserDataFromSupabase(userId: string): Promise<UserDataStore | null> {
  const client = getSupabaseAdmin()
  if (!client || !userId) return null

  try {
    const [
      { data: projects },
      { data: activities },
      { data: skills },
      { data: learningTracks },
      { data: goals },
      { data: evidence },
      { data: capabilities },
      { data: problems }
    ] = await Promise.all([
      client.from('projects').select('*').eq('user_id', userId),
      client.from('activities').select('*').eq('user_id', userId),
      client.from('skills').select('*').eq('user_id', userId),
      client.from('learning_tracks').select('*').eq('user_id', userId),
      client.from('goals').select('*').eq('user_id', userId),
      client.from('evidence').select('*').eq('user_id', userId),
      client.from('capabilities').select('*').eq('user_id', userId),
      client.from('problems').select('*').eq('user_id', userId)
    ])

    return {
      userProfile: null,
      projects: projects || [],
      activities: activities || [],
      skills: skills || [],
      learningTracks: learningTracks || [],
      goals: goals || [],
      evidence: evidence || [],
      capabilities: capabilities || [],
      problems: problems || []
    }
  } catch (err) {
    console.error('Failed to fetch user data from Supabase PostgreSQL:', err)
    return null
  }
}

/**
 * Upsert user record and sync entities to Supabase PostgreSQL
 */
export async function syncUserDataToSupabase(userId: string, data: Partial<UserDataStore>): Promise<boolean> {
  const client = getSupabaseAdmin()
  if (!client || !userId) return false

  try {
    if (data.userProfile) {
      await client.from('users').upsert({
        id: userId,
        email: data.userProfile.email,
        display_name: data.userProfile.display_name,
        first_name: data.userProfile.first_name,
        last_name: data.userProfile.last_name,
        photo_url: data.userProfile.photoURL,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' }).catch(() => null)
    }
    if (data.projects?.length) {
      const records = data.projects.map((p) => ({
        id: p.id,
        user_id: userId,
        name: p.name,
        description: p.description,
        status: p.status || 'Active',
        category: p.category || 'General',
        repository_url: p.repositoryUrl || p.repository_url,
        updated_at: new Date().toISOString()
      }))
      await client.from('projects').upsert(records, { onConflict: 'id' })
    }

    if (data.activities?.length) {
      const records = data.activities.map((a) => ({
        id: a.id,
        user_id: userId,
        work: a.work,
        learning: a.learning,
        struggle: a.struggle,
        intention: a.intention,
        project_id: a.projectId || a.project_id,
        skill_id: a.skillId || a.skill_id,
        date: a.date || new Date().toISOString().split('T')[0]
      }))
      await client.from('activities').upsert(records, { onConflict: 'id' })
    }

    if (data.skills?.length) {
      const records = data.skills.map((s) => ({
        id: s.id,
        user_id: userId,
        name: s.name,
        category: s.category || 'Technical',
        status: s.status || 'ACTIVE',
        goal: s.goal
      }))
      await client.from('skills').upsert(records, { onConflict: 'id' })
    }

    return true
  } catch (err) {
    console.error('Failed to sync user data to Supabase:', err)
    return false
  }
}
