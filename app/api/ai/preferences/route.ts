import { NextResponse } from 'next/server'
import { setProviderPreferences } from '@/lib/ai/credential-vault'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const { primaryProvider, fallbackEnabled } = body as {
      primaryProvider?: 'gemini' | 'groq'
      fallbackEnabled?: boolean
    }

    if (primaryProvider) {
      setProviderPreferences(primaryProvider, fallbackEnabled !== false)
    }

    return NextResponse.json({ success: true, message: 'AI provider preferences updated successfully.' })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Failed to update preferences.' },
      { status: 500 }
    )
  }
}
