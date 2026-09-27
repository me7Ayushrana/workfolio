import { NextResponse } from 'next/server'
import { aiService } from '@/lib/ai/ai-service'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const { transcript, projects, skills, apiKey, model } = body

    if (!transcript || typeof transcript !== 'string' || !transcript.trim()) {
      return NextResponse.json(
        { success: false, status: 'error', message: 'Voice transcript is required.' },
        { status: 400 }
      )
    }

    const draft = await aiService.parseVoiceTranscript(transcript, projects || [], skills || [], { apiKey, model })
    return NextResponse.json({ success: true, status: 'success', draft, transcript })
  } catch (err: any) {
    if (err?.code === 'NOT_CONFIGURED') {
      return NextResponse.json(
        {
          success: false,
          status: 'unconfigured',
          message: 'AI is not configured yet. Please set GEMINI_API_KEY on the server or connect your key.'
        },
        { status: 200 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        status: 'error',
        message: err?.message || 'Failed to process voice transcript with AI.'
      },
      { status: 500 }
    )
  }
}
