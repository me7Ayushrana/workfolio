import { NextResponse } from 'next/server'
import { aiService } from '@/lib/ai/ai-service'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const { question, contextData, apiKey, model } = body

    if (!question || typeof question !== 'string' || !question.trim()) {
      return NextResponse.json(
        { success: false, status: 'error', message: 'Question is required.' },
        { status: 400 }
      )
    }

    const result = await aiService.askWorkfolio(question, contextData || {}, { apiKey, model })
    return NextResponse.json({ success: true, status: 'success', ...result })
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
        message: err?.message || 'Failed to query Workfolio assistant.'
      },
      { status: 500 }
    )
  }
}
