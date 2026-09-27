import { NextResponse } from 'next/server'
import { aiService } from '@/lib/ai/ai-service'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const { context, apiKey, model } = body

    const result = await aiService.generateNextActions(context || {}, { apiKey, model })
    return NextResponse.json({ success: true, status: 'success', suggestions: result.suggestions })
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
        message: err?.message || 'Failed to generate next action suggestions.'
      },
      { status: 500 }
    )
  }
}
