import { BaseAIProvider, AIGenerateOptions, AIChatOptions } from './base'
import { AIProviderId, AISourceAttribution } from '../types'
import { AIProviderStatus } from '../credential-vault'

export class GeminiProvider extends BaseAIProvider {
  id: AIProviderId = 'gemini'
  name = 'Google Gemini'
  defaultModel = 'gemini-1.5-flash'
  supportsMultimodal = true

  async testConnection(
    apiKey: string,
    model: string = this.defaultModel
  ): Promise<{ success: boolean; status: AIProviderStatus; message: string }> {
    const cleanKey = apiKey?.trim().replace(/^["']|["']$/g, '').replace(/[\r\n\t]/g, '') || ''
    if (!cleanKey) {
      return {
        success: false,
        status: 'NOT_CONFIGURED',
        message: 'Google Gemini API key is missing. Please enter your API key.'
      }
    }

    try {
      // Direct REST call to Google Gemini official models endpoint to strictly verify key accuracy
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${cleanKey}`,
        {
          method: 'GET',
          headers: {
            'User-Agent': 'Workfolio/1.0',
            'Accept': 'application/json'
          }
        }
      )

      if (res.ok) {
        return {
          success: true,
          status: 'VALID',
          message: `Successfully connected & verified Google Gemini API Key!`
        }
      }

      const errorData = await res.json().catch(() => ({}))
      const rawMsg = errorData?.error?.message || `HTTP ${res.status}`
      const lowerMsg = rawMsg.toLowerCase()

      if (res.status === 400 || res.status === 401) {
        return {
          success: false,
          status: 'INVALID',
          message: `Google Gemini rejected API key (${res.status}): ${rawMsg}. Please check your key at aistudio.google.com.`
        }
      }

      if (res.status === 403) {
        if (lowerMsg.includes('quota') || lowerMsg.includes('billing')) {
          return {
            success: false,
            status: 'BILLING_REQUIRED',
            message: `Google Gemini billing/quota issue (${res.status}): ${rawMsg}`
          }
        }
        return {
          success: false,
          status: 'PERMISSION_ERROR',
          message: `Google Gemini permission error (${res.status}): ${rawMsg}`
        }
      }

      if (res.status === 429) {
        return {
          success: false,
          status: 'RATE_LIMITED',
          message: `Google Gemini rate limit exceeded (${res.status}): ${rawMsg}`
        }
      }

      if (res.status >= 500) {
        return {
          success: false,
          status: 'PROVIDER_ERROR',
          message: `Google Gemini service temporary error (HTTP ${res.status}): ${rawMsg}`
        }
      }

      return {
        success: false,
        status: 'INVALID',
        message: `Google Gemini rejected key (HTTP ${res.status}): ${rawMsg}`
      }
    } catch (err: any) {
      return {
        success: false,
        status: 'NETWORK_ERROR',
        message: `Network failure connecting to Google Gemini API: ${err?.message || 'Connection refused'}`
      }
    }
  }

  async generateText(options: AIGenerateOptions): Promise<string> {
    const key = options.apiKey?.trim()
    if (!key) {
      const err: any = new Error('Google Gemini API key is not configured.')
      err.code = 'NOT_CONFIGURED'
      throw err
    }

    const modelName = options.model && options.model.includes('gemini') ? options.model : this.defaultModel
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
      const errData = await res.json().catch(() => ({}))
      const msg = errData?.error?.message || `Gemini API returned HTTP ${res.status}`
      const err: any = new Error(msg)
      if (res.status === 401 || res.status === 400) err.code = 'INVALID'
      else if (res.status === 429) err.code = 'RATE_LIMITED'
      else if (res.status === 403) err.code = 'PERMISSION_ERROR'
      else if (res.status >= 500) err.code = 'PROVIDER_ERROR'
      throw err
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
      const err: any = new Error(`Failed to parse Gemini structured JSON output: ${e.message}`)
      err.code = 'STRUCTURED_PARSE_ERROR'
      throw err
    }
  }

  async chat(options: AIChatOptions): Promise<{ text: string; sources?: AISourceAttribution[] }> {
    const key = options.apiKey?.trim()
    if (!key) {
      const err: any = new Error('Google Gemini API key is not configured.')
      err.code = 'NOT_CONFIGURED'
      throw err
    }

    const modelName = options.model && options.model.includes('gemini') ? options.model : this.defaultModel
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${key}`

    const contents = options.messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }))

    if (options.systemInstruction) {
      contents.unshift({
        role: 'user',
        parts: [{ text: `SYSTEM INSTRUCTION:\n${options.systemInstruction}` }]
      })
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents })
    })

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      throw new Error(errData?.error?.message || `Gemini API returned HTTP ${res.status}`)
    }

    const data = await res.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
    return { text, sources: options.contextSources }
  }

  async analyzeImage(imageUrl: string, prompt: string, apiKey?: string): Promise<string> {
    return this.generateText({ prompt: `${prompt}\n[Image URL: ${imageUrl}]`, apiKey })
  }

  async analyzeDocument(documentText: string, prompt: string, apiKey?: string): Promise<string> {
    return this.generateText({ prompt: `${prompt}\n\nDocument Content:\n${documentText}`, apiKey })
  }
}
