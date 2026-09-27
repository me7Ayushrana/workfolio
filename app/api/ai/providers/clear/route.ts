import { NextResponse } from 'next/server'
import { clearBYOKCredential } from '@/lib/ai/credential-vault'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const { providerId } = body as { providerId?: 'gemini' | 'groq' }

    if (!providerId || (providerId !== 'gemini' && providerId !== 'groq')) {
      return NextResponse.json({ success: false, message: 'Valid providerId is required.' }, { status: 400 })
    }

    clearBYOKCredential(providerId)
    return NextResponse.json({ success: true, message: `Disconnected ${providerId === 'gemini' ? 'Google Gemini' : 'Groq'} key.` })
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || 'Failed to clear key.' }, { status: 500 })
  }
}
