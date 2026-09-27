import { NextResponse } from 'next/server'
import { aiService } from '@/lib/ai/ai-service'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const { text, projects, skills, apiKey, model } = body

    if (!text || typeof text !== 'string' || !text.trim()) {
      return NextResponse.json(
        { success: false, status: 'error', message: 'Activity text is required.' },
        { status: 400 }
      )
    }

    const draft = await aiService.parseActivity(text, projects || [], skills || [], { apiKey, model })
    return NextResponse.json({ success: true, status: 'success', draft })
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
        message: err?.message || 'Failed to parse activity with AI.'
      },
      { status: 500 }
    )
  }
}
