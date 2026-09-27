import { NextResponse } from 'next/server'
import { getEffectiveProviderConfig, getProviderPreferences } from '@/lib/ai/credential-vault'
import { aiService } from '@/lib/ai/ai-service'

export async function GET() {
  try {
    const prefs = getProviderPreferences()

    const geminiEffective = getEffectiveProviderConfig('gemini')
    const groqEffective = getEffectiveProviderConfig('groq')

    // Perform live connection checks safely without throwing
    const geminiCheck = await aiService.testConnection('gemini', '').catch((err) => ({
      success: false,
      status: 'PROVIDER_ERROR' as const,
      message: err?.message || 'Connection check error'
    }))

    const groqCheck = await aiService.testConnection('groq', '').catch((err) => ({
      success: false,
      status: 'PROVIDER_ERROR' as const,
      message: err?.message || 'Connection check error'
    }))

    const isAnyBYOK = geminiEffective.mode === 'byok' || groqEffective.mode === 'byok'

    return NextResponse.json({
      mode: isAnyBYOK ? 'byok' : 'platform',
      primaryProvider: prefs.primaryProvider,
      fallbackEnabled: prefs.fallbackEnabled,
      gemini: {
        configured: geminiEffective.isConfigured,
        status: geminiCheck.status,
        mode: geminiEffective.mode,
        model: geminiEffective.model,
        lastValidatedAt: new Date().toISOString(),
        message: geminiCheck.message
      },
      groq: {
        configured: groqEffective.isConfigured,
        status: groqCheck.status,
        mode: groqEffective.mode,
        model: groqEffective.model,
        lastValidatedAt: new Date().toISOString(),
        message: groqCheck.message
      }
    })
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve AI system diagnostics',
        message: err?.message || 'Internal server error'
      },
      { status: 500 }
    )
  }
}
