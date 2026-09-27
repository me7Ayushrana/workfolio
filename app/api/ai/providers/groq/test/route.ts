import { NextResponse } from 'next/server'
import { aiService } from '@/lib/ai/ai-service'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const { apiKey, model } = body as { apiKey?: string; model?: string }

    const result = await aiService.testConnection('groq', apiKey || '', model)
    return NextResponse.json(result)
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        status: 'PROVIDER_ERROR',
        message: `Validation failed: ${err?.message || 'Server error'}`
      },
      { status: 500 }
    )
  }
}
