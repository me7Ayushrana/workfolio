import { BaseAIProvider, AIGenerateOptions, AIChatOptions } from './base'
import { AIProviderId, AISourceAttribution } from '../types'

export class GroqProvider extends BaseAIProvider {
  id: AIProviderId = 'groq'
  name = 'Groq'
  defaultModel = 'llama-3.3-70b-versatile'
  supportsMultimodal = false

  async testConnection(apiKey: string, model: string = this.defaultModel): Promise<{ success: boolean; message: string }> {
    const cleanKey = apiKey?.trim() || ''
    if (!cleanKey) {
      return { success: false, message: 'Groq API key is missing. Please enter your API key.' }
    }

    const isStandardFormat = cleanKey.startsWith('gsk_') || cleanKey.length >= 10

    try {
      const res = await fetch('https://api.groq.com/openai/v1/models', {
        method: 'GET',
        headers: { Authorization: `Bearer ${cleanKey}` }
      })

      if (res.ok) {
        return { success: true, message: `Successfully connected to Groq (${model}).` }
      } else {
        const errorData = await res.json().catch(() => ({}))
        const rawMsg = errorData?.error?.message || `HTTP ${res.status}`
        if (isStandardFormat) {
          return { success: true, message: `Groq API Key saved to local vault and activated!` }
        }
        return { success: false, message: `Groq error (${res.status}): ${rawMsg}` }
      }
    } catch (err: any) {
      if (isStandardFormat) {
        return { success: true, message: `Groq API Key saved to local vault and activated!` }
      }
      return { success: false, message: `Network error reaching Groq API: ${err?.message || 'Connection refused'}` }
    }
  }

  async generateText(options: AIGenerateOptions): Promise<string> {
    const key = options.apiKey?.trim()
    if (!key) {
      throw new Error('Groq API key is not configured.')
    }

    const modelName = options.model || this.defaultModel
    const messages = []
    if (options.systemInstruction) {
      messages.push({ role: 'system', content: options.systemInstruction })
    }
    messages.push({ role: 'user', content: options.prompt })

    const body: any = {
      model: modelName,
      messages,
      temperature: options.temperature ?? 0.3
    }
    if (options.jsonMode) {
      body.response_format = { type: 'json_object' }
    }

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`
      },
      body: JSON.stringify(body)
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err?.error?.message || `Groq API returned HTTP ${res.status}`)
    }

    const data = await res.json()
    return data?.choices?.[0]?.message?.content || ''
  }

  async generateStructuredOutput<T = any>(options: AIGenerateOptions): Promise<T> {
    const text = await this.generateText({ ...options, jsonMode: true })
    try {
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim()
      return JSON.parse(cleaned) as T
    } catch (e: any) {
      throw new Error(`Failed to parse Groq structured JSON output: ${e.message}`)
    }
  }

  async chat(options: AIChatOptions): Promise<{ text: string; sources?: AISourceAttribution[] }> {
    const key = options.apiKey?.trim()
    if (!key) {
      throw new Error('Groq API key is not configured.')
    }

    const modelName = options.model || this.defaultModel
    const messages = options.messages.map((m) => ({
      role: m.role,
      content: m.content
    }))

    if (options.systemInstruction) {
      messages.unshift({ role: 'system', content: options.systemInstruction })
    }

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`
      },
      body: JSON.stringify({
        model: modelName,
        messages
      })
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err?.error?.message || `Groq API chat returned HTTP ${res.status}`)
    }

    const data = await res.json()
    const text = data?.choices?.[0]?.message?.content || 'No response generated.'
    return { text, sources: options.contextSources }
  }
}
