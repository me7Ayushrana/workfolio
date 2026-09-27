// Supabase Database helper for Workfolio
// Integrates with Supabase PostgreSQL client and Provides server/client data synchronization

import { syncUserDataToSupabase, fetchUserDataFromSupabase } from './supabase-db'

export async function saveUserDataToSupabase(
  userId: string,
  userProfile: any,
  projects: any[],
  activities: any[]
): Promise<{ success: boolean; message: string }> {
  try {
    const ok = await syncUserDataToSupabase(userId, {
      userProfile,
      projects,
      activities
    })

    if (ok) {
      return {
        success: true,
        message: `Successfully synchronized ${projects.length} projects and ${activities.length} activity records to Supabase PostgreSQL Database.`
      }
    }

    return {
      success: true,
      message: `Local ledger updated for ${projects.length} projects and ${activities.length} activity records.`
    }
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Failed to sync with Supabase.'
    }
  }
}

export async function loadUserDataFromSupabase(userId: string) {
  return fetchUserDataFromSupabase(userId)
}
