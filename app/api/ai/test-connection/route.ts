import { NextResponse } from 'next/server'
import { aiService } from '@/lib/ai/ai-service'
import { AIProviderId } from '@/lib/ai/types'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { providerId, apiKey, model } = body as {
      providerId: AIProviderId
      apiKey: string
      model?: string
    }

    if (!providerId || !apiKey) {
      return NextResponse.json(
        { success: false, message: 'Provider ID and API key are required.' },
        { status: 400 }
      )
    }

    const result = await aiService.testConnection(providerId, apiKey, model)
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: `Server verification failed: ${error?.message || 'Unknown error'}` },
      { status: 500 }
    )
  }
}
