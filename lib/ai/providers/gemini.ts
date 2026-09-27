import { BaseAIProvider, AIGenerateOptions, AIChatOptions } from './base'
import { AIProviderId, AISourceAttribution } from '../types'

export class GeminiProvider extends BaseAIProvider {
  id: AIProviderId = 'gemini'
  name = 'Google Gemini'
  defaultModel = 'gemini-1.5-flash'
  supportsMultimodal = true

  async testConnection(apiKey: string, model: string = this.defaultModel): Promise<{ success: boolean; message: string }> {
    const cleanKey = apiKey?.trim() || ''
    if (!cleanKey) {
      return { success: false, message: 'Google Gemini API key is missing. Please enter your API key.' }
    }

    try {
      // Validate key against Google Gemini official models REST endpoint
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${cleanKey}`,
        { method: 'GET' }
      )

      if (res.ok) {
        return { success: true, message: `Successfully connected & verified Google Gemini API Key!` }
      } else {
        const errorData = await res.json().catch(() => ({}))
        const rawMsg = errorData?.error?.message || `HTTP ${res.status}`
        return {
          success: false,
          message: `Key Verification Failed (${res.status}): ${rawMsg}`
        }
      }
    } catch (err: any) {
      return { success: false, message: `Network error reaching Google Gemini API: ${err?.message || 'Connection refused'}` }
    }
  }

  async generateText(options: AIGenerateOptions): Promise<string> {
    const key = options.apiKey?.trim()
    if (!key) {
      throw new Error('Google Gemini API key is not configured.')
    }

    const modelName = options.model || this.defaultModel
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${key}`

    const contents = []
    if (options.systemInstruction) {
      contents.push({
        role: 'user',
        parts: [{ text: `SYSTEM INSTRUCTION:\n${options.systemInstruction}` }]
      })
    }
    contents.push({
      role: 'user',
      parts: [{ text: options.prompt }]
    })

    const body: any = { contents }
    if (options.jsonMode) {
      body.generationConfig = { responseMimeType: 'application/json' }
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err?.error?.message || `Gemini API returned HTTP ${res.status}`)
    }

    const data = await res.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
    return text
  }

  async generateStructuredOutput<T = any>(options: AIGenerateOptions): Promise<T> {
    const text = await this.generateText({ ...options, jsonMode: true })
    try {
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim()
      return JSON.parse(cleaned) as T
    } catch (e: any) {
      throw new Error(`Failed to parse Gemini structured JSON output: ${e.message}`)
    }
  }

  async chat(options: AIChatOptions): Promise<{ text: string; sources?: AISourceAttribution[] }> {
    const key = options.apiKey?.trim()
    if (!key) {
      throw new Error('Google Gemini API key is not configured.')
    }

    const modelName = options.model || this.defaultModel
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${key}`

    const formattedContents = options.messages.map((m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }))

    if (options.systemInstruction) {
      formattedContents.unshift({
        role: 'user',
        parts: [{ text: `SYSTEM INSTRUCTION:\n${options.systemInstruction}` }]
      })
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: formattedContents })
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err?.error?.message || `Gemini API chat returned HTTP ${res.status}`)
    }

    const data = await res.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.'
    return { text, sources: options.contextSources }
  }

  async analyzeImage(imageUrl: string, prompt: string, apiKey?: string): Promise<string> {
    return this.generateText({
      prompt: `[Analyze Image from URL: ${imageUrl}]\n\nPrompt: ${prompt}`,
      apiKey
    })
  }

  async analyzeDocument(documentText: string, prompt: string, apiKey?: string): Promise<string> {
    return this.generateText({
      prompt: `[Document Content Begin]\n${documentText.slice(0, 15000)}\n[Document Content End]\n\nTask: ${prompt}`,
      apiKey
    })
  }
}
